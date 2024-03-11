import { cleanup, render, screen } from "@testing-library/react"
import HomePage from "../Homepage"
import { IntlProviderWrapper } from "../../utils/context/i18n"
import { BrowserRouter } from "react-router-dom";
import { renderWithReactIntl } from "./EditorPage.test";

afterEach(() => {
  cleanup();
})

test("should render homepage component", () => {
  render(
    <BrowserRouter>
      <IntlProviderWrapper>
        <HomePage />
      </IntlProviderWrapper>
    </BrowserRouter>
  );
  const homePageElement = screen.getByTestId("homepage");
  expect(homePageElement).toBeInTheDocument();
})

test("matches home page snapshot", async () => {
  const { asFragment } = renderWithReactIntl(
    <BrowserRouter>
      <IntlProviderWrapper>
        <HomePage />
      </IntlProviderWrapper>
    </BrowserRouter>
  );
  expect(asFragment()).toMatchSnapshot();
})