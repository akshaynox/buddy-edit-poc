import { cleanup, render, screen } from "@testing-library/react"
import EditorPage from "../EditorPage"
import { IntlProviderWrapper } from "../../utils/context/i18n"
import { BrowserRouter } from "react-router-dom";
import { IntlProvider } from 'react-intl';

export const renderWithReactIntl = (component) => {
  const messages = {
    "title": "Buddy Edit",
    "room_id": "Room Id",
    "username": "Username",
    "join": "Join",
    "no_invite": "No invitation code? then create",
    "new_room": "new room",
    "created_room": "Created New Room",
    "editing_users": "Editing Users",
    "leave": "Leave",
    "me": "Me",
    "copy_room_id": "Copy Room ID",
    "details_required": "Room ID & username is required",
    "room_id_clipboard": "Room ID copied to clipboard!",
    "joined_room": "has joined the room.",
    "left_room": "has left the room.",
    "start_collab": "Start collaborating as a team..."
  }

  return render(
    <IntlProvider locale={"en"} messages={messages}>
      {component}
    </IntlProvider>
  );
};

afterEach(() => {
  cleanup();
})

test("should render editor component", () => {
  render(
    <BrowserRouter>
      <IntlProviderWrapper>
        <EditorPage />
      </IntlProviderWrapper>
    </BrowserRouter>
  );
  const editorPageElement = screen.getByTestId("editorpage");
  expect(editorPageElement).toBeInTheDocument();
})

test("should render connected users", () => {
  render(
    <BrowserRouter>
      <IntlProviderWrapper>
        <EditorPage />
      </IntlProviderWrapper>
    </BrowserRouter>
  );
  const connectedUserElement = screen.getByText(/Editing Users/i);
  expect(connectedUserElement).toBeInTheDocument();
})

test("matches editor page snapshot", async () => {
  const { asFragment } = renderWithReactIntl(
    <BrowserRouter>
      <IntlProviderWrapper>
        <EditorPage />
      </IntlProviderWrapper>
    </BrowserRouter>
  );
  expect(asFragment()).toMatchSnapshot();
})