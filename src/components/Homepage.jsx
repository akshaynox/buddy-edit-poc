import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FormattedMessage, useIntl } from "react-intl";
import LangSwitcher from "./LangSwitcher";

const HomePage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState("");
  const intl = useIntl();

  const handleCreateRoom = () => {
    const newRoomId = Math.random().toString(36).substring(2, 10); // Generate a random room ID
    setRoomId(newRoomId); // Set the room ID
    toast.success(intl.formatMessage({ id: "created_room" }));
  };

  const handleJoinRoom = () => {
    if (roomId && username) {
      navigate(`/editor/${roomId}?username=${username}`);
    } else if (!roomId || !username) {
      toast.error(intl.formatMessage({ id: "details_required" }));
    }
  };

  return (
    <div
      id="body"
      className="h-full m-0 bg-gradient-to-br from-[#005662] to-[#00334d]"
      data-testid="homepage"
    >
      <div className="fixed right-10 top-10">
        <LangSwitcher />
      </div>
      <div className="homePageWrapper flex align items-center justify-center text-white h-screen">
        <div className="formWrapper bg-[#283236] p-5 rounded-md w-[500px] max-w-[90%]">
          <h4 className="mainLabel mb-5 mt-0 text-xl font-bold">
            <FormattedMessage id="title" />
          </h4>
          <div className="inputGroup flex flex-col">
            <input
              type="text"
              className="inputBox"
              placeholder={intl.formatMessage({ id: "room_id" })}
              onChange={(e) => setRoomId(e.target.value)}
              value={roomId}
            />
            <input
              type="text"
              className="inputBox"
              placeholder={intl.formatMessage({ id: "username" })}
              onChange={(e) => setUsername(e.target.value)}
              value={username}
            />
            <button
              className="btn joinBtn bg-[color:var(--btn-green)] w-25 ml-auto hover:bg-[#2b824c] text-black p-2 rounded-md min-w-4"
              onClick={handleJoinRoom}
            >
              <FormattedMessage id="join" />
            </button>
            <span className="createInfo mx-0 my-auto mt-5">
              <FormattedMessage id="no_invite" />
              &nbsp;
              <button
                onClick={handleCreateRoom}
                className="createNewBtn text-[color:var(--btn-green)] border-b-[1px_solid_#4aed88] hover:cursor-pointer"
              >
                <FormattedMessage id="new_room" />
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
