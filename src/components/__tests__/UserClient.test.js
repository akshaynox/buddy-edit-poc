import { cleanup, render, screen } from "@testing-library/react"
import UserClient from "../UserClient"
import { IntlProviderWrapper } from "../../utils/context/i18n"
import { BrowserRouter } from "react-router-dom";
import { renderWithReactIntl } from "./EditorPage.test";

afterEach(() => {
  cleanup();
})

test("should render user client component for another user", () => {
  render(
    <BrowserRouter>
      <IntlProviderWrapper>
        <UserClient username={"anotheruser"} isCurrentUser={false} />
      </IntlProviderWrapper>
    </BrowserRouter>
  );
  const userElement = screen.getByText(/anotheruser/i);
  expect(userElement).toBeInTheDocument();
})

test("should render user client component for current user", () => {
  render(
    <BrowserRouter>
      <IntlProviderWrapper>
        <UserClient username={"currentuser"} isCurrentUser={true} />
      </IntlProviderWrapper>
    </BrowserRouter>
  );
  const userElement = screen.getByText(/ME/i);
  expect(userElement).toBeInTheDocument();
})

test("matches user client snapshot", async () => {
  const { asFragment } = renderWithReactIntl(
    <BrowserRouter>
      <IntlProviderWrapper>
        <UserClient />
      </IntlProviderWrapper>
    </BrowserRouter>
  );
  expect(asFragment()).toMatchSnapshot();
})