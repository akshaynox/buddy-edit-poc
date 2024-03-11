import { cleanup, render, screen } from "@testing-library/react"
import { IntlProviderWrapper } from "../../utils/context/i18n"
import { BrowserRouter } from "react-router-dom";
import { renderWithReactIntl } from "./EditorPage.test";
import LangSwitcher from "../LangSwitcher";

afterEach(() => {
  cleanup();
})

test("should render lang switcher component", () => {
  render(
    <BrowserRouter>
      <IntlProviderWrapper>
        <LangSwitcher />
      </IntlProviderWrapper>
    </BrowserRouter>
  );
  const langSwitcherElement = screen.getByTestId("langswitcher");
  expect(langSwitcherElement).toBeInTheDocument();
})

test("matches language switcher snapshot", async () => {
  const { asFragment } = renderWithReactIntl(
    <BrowserRouter>
      <IntlProviderWrapper>
        <LangSwitcher />
      </IntlProviderWrapper>
    </BrowserRouter>
  );
  expect(asFragment()).toMatchSnapshot();
})