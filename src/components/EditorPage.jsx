import React, { useEffect, useState, useRef } from "react";
import ReactQuill, { Quill } from "react-quill";
import "quill/dist/quill.snow.css";
import io from "socket.io-client";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Delta from "quill-delta";
import toast from "react-hot-toast";
import UserClient from "../components/UserClient";
import QuillCursors from "quill-cursors";
import { FormattedMessage, useIntl } from "react-intl";
import generateRandomColor from "../utils/generateRandomColor";

Quill.register("modules/cursors", QuillCursors);

const EditorPage = () => {
  const { roomId } = useParams();
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const username = query.get("username");
  const reactNavigator = useNavigate();
  const intl = useIntl();

  const [socket, setSocket] = useState(null);
  const [documentState, setDocumentState] = useState(null); // New state to keep track of the document state
  const [clients, setClients] = useState([]); // New state for connected clients array

  const quillRef = useRef(null);

  // Define the modules
  const modules = {
    cursors: {
      hideDelayMs: 500,
      hideSpeedMs: 300,
      selectionChangeSource: null,
      transformOnTextChange: true,
    },
    toolbar: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline"],
      ["image", "code-block"],
    ],
  };

  useEffect(() => {
    //Quill initialization
    console.log(
      "1st time component rendering. So, Quill REF: " + quillRef.current
    );
    if (quillRef.current) return; //If already set Return i.e Object exists
    const editor = quillRef.current.getEditor();

    editor.setText("Loading...");
    //editor.setContents(staticDelta);  //For Testing
    quillRef.current = editor;
    console.log("1st useEffect For Quill Initialization");
  }, []);

  // -----------------------------------------2nd useEffect()    Starts --------------------------------------------------
  useEffect(() => {
    if (!quillRef.current) {
      console.error("Quill Editor is not initialized yet.");
      return;
    }
    console.log("2nd useEffect");

    const socketInstance = io("http://localhost:5000");
    setSocket(socketInstance);

    socketInstance.on("connect", () => {
      console.log("Socket connected, joining room with ID:", roomId);
      socketInstance.emit("join-room", { roomId, username });
    });

    // Event handlers for user join
    socketInstance.on("user-joined", (username) => {
      if (typeof socket === "undefined") return;
      setClients((prev) => [...prev, username]);

      const color = generateRandomColor();
      const cursors = quillRef.current.getEditor().getModule("cursors");
      const allCursors = cursors.cursors();
      console.log("All available cursors " + JSON.stringify(allCursors));
      if (!allCursors.some((cursor) => cursor.id === username)) {
        cursors.createCursor(username, username, color);
      }

      toast.success(`${username} ${intl.formatMessage({ id: "joined_room" })}`);
      socketInstance.emit("connected-users", clients); //Emit User Array
    });

    socketInstance.on("connected-users", handleConnectedUsers);

    socketInstance.on("initialize-document", (documentState) => {
      //console.log("Received document state:", documentState);
      const delta = new Delta(documentState);

      if (typeof documentState === "object" && documentState !== null) {
        quillRef.current.getEditor().setContents(delta, "silent");
        setDocumentState(delta);
      } else {
        console.error(
          "Document state is neither a string nor a valid object:",
          documentState
        );
        quillRef.current.getEditor().setText("Failed to load document.");
      }
      quillRef.current.getEditor().enable();
    });

    socketInstance.on("text-change", (data) => {
      if (data.username !== username) {
        const delta = new Delta(data.delta);
        quillRef.current.getEditor().updateContents(delta, "silent");
        //   console.log("ON text-change " + JSON.stringify(delta));
        setDocumentState((prevState) => {
          if (prevState) {
            const newDocumentState = prevState.compose(delta);
            // console.log("New document state after compose:", newDocumentState);
            return newDocumentState;
          } else {
            console.error("Previous state is undefined.");
            return new Delta(); // Reset to an empty Delta if undefined
          }
        });
      }
    });

    socketInstance.on("user-left", (username) => {
      setClients((prev) => prev.filter((user) => user !== username));

      const cursors = quillRef.current.getEditor().getModule("cursors");
      cursors.removeCursor(username, username);

      toast.success(`${username} ${intl.formatMessage({ id: "left_room" })}`);
      socketInstance.emit("connected-users", clients);
    });

    return () => {
      socketInstance.off("user-joined");
      socketInstance.off("connected-users");
      socketInstance.off("initialize-document");
      socketInstance.off("text-change");
      socketInstance.off("user-left");
      socketInstance.disconnect();
      if (quillRef.current)
        //object exists
        quillRef.current.getEditor().off("text-change");
      console.log("Cleaned up on component unmount");
    };
  }, [roomId, username]);

  // -----------------------------------------------------------2nd UseEffect ends--------------------------------------------------------------

  //Function to handle all connected clients
  const handleConnectedUsers = (users) => {
    console.log(`Updated list of connected users: ${users}`);
    setClients(users);
  };

  // Function to handle leaving the room
  const leaveRoom = () => {
    if (!socket) return;
    socket.emit("leave-room", { roomId, username });
    reactNavigator("/");
  };

  // --------------------------------3rd effect ----------------------------------------------
  useEffect(() => {
    if (!socket || !quillRef.current) return;

    const handleTextChange = (delta, oldDelta, source) => {
      if (source !== "user") return;

      let range = quillRef.current.getEditor().getSelection();
      if (range) {
        if (range.length == 0) {
          // User is actively typing, update the cursor position
          socket.emit("cursor-move", { roomId, username, cursorPos: range });
        } else {
          // User made a selection
          console.log("User has made a selection");
        }
      }

      socket.emit("text-change", { roomId, username, delta: delta });
      saveCurrentDocumentState();
    };

    const handleSelectionChange = (range) => {
      if (!socket) return;
      socket.emit("cursor-selection", { roomId, username, cursorPos: range });
      console.log("Selection-change of quill: " + JSON.stringify(range)); //{"index":0,"length":0}
    };

    socket.on("remote-cursor-selection", ({ username, cursorPos }) => {
      console.log(
        "Remote cursor selection point for " +
          username +
          " " +
          JSON.stringify(cursorPos)
      );
      const color = generateRandomColor();
      const cursors = quillRef.current.getEditor().getModule("cursors");
      const allCursors = cursors.cursors();
      console.log("All cursors " + JSON.stringify(allCursors));
      if (!allCursors.some((cursor) => cursor.id === username)) {
        cursors.createCursor(username, username, color);
      }

      cursors.moveCursor(username, cursorPos); // <== cursor data from previous step
      cursors.toggleFlag(username, true);
    });

    socket.on("remote-cursor-move", ({ username, cursorPos }) => {
      console.log(
        "Remote cursor move for " + username + " " + JSON.stringify(cursorPos)
      );
      const cursors = quillRef.current.getEditor().getModule("cursors");
      cursors.moveCursor(username, cursorPos); // <== cursor data from previous step
      cursors.toggleFlag(username, true);
    });

    quillRef.current.getEditor().on("text-change", handleTextChange);

    quillRef.current
      .getEditor()
      .on("selection-change", (range, oldRange, source) => {
        handleSelectionChange(range);
      });

    return () => {
      socket.off("remote-cursor-selection");
      socket.off("remote-cursor-move");

      if (quillRef.current) {
        quillRef.current.getEditor().off("text-change", handleTextChange);
        quillRef.current.getEditor().off("selection-change");
      }
    };
  }, [socket, roomId, username]);

  // Function to save the current document state to the server
  const saveCurrentDocumentState = () => {
    if (!quillRef.current) return;
    if (quillRef.current) {
      const currentContents = quillRef.current.getEditor().getContents(); // Get the current state of the editor
      const serializedContent = JSON.stringify(currentContents); // Serialize the state
      socket.emit("save-document", { roomId, content: serializedContent });
    }
  };

  // Function to copy room ID to clipboard
  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    toast.success(intl.formatMessage({ id: "room_id_clipboard" }));
  };

  return (
    <div className="mainWrap flex">
      <div className="aside flex-[0.2] bg-[#283236] p-4 text-white flex flex-col justify-center items-center gap-2">
        <div className="asideInner flex-1">
          <h3 className="text-xl font-bold">
            <FormattedMessage id="editing_users" />
          </h3>
          <div className="clientsList flex items-center flex-wrap gap-5 m-5">
            {clients.map((client, index) => (
              <UserClient
                key={index}
                username={client}
                isCurrentUser={client === username}
              />
            ))}
          </div>
        </div>
        <button
          className="btn copyBtn bg-white text-black w-[200px]"
          onClick={copyRoomId}
        >
          <FormattedMessage id="copy_room_id" />
        </button>
        <button
          className="btn leaveBtn bg-[#4aed88] text-black w-[200px]"
          onClick={leaveRoom}
        >
          <FormattedMessage id="leave" />
        </button>
      </div>
      <div className="editorWrap flex-1">
        <div className="editor-container" style={{ height: "100vh" }}>
          {" "}
          <ReactQuill
            ref={quillRef}
            theme="snow"
            modules={modules}
            placeholder={intl.formatMessage({ id: "start_collab" })}
            style={{ height: "100%" }}
          />
        </div>
      </div>
    </div>
  );
};

export default EditorPage;
