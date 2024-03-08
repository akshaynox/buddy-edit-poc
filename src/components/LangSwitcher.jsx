import React, { useContext } from "react";
import { IntlContext } from "../utils/context/i11n";

const langTitles = {
  en: "English",
  de: "German",
  fr: "French",
};

export const names = [{ lang: "en" }, { lang: "de" }, { lang: "fr" }];

const LangSwitcher = () => {
  const intlContext = useContext(IntlContext);

  // ** Function to switch Language
  const handleChange = (event) => {
    const {
      target: { value },
    } = event;
    intlContext.switchLanguage(value);
  };

  return (
    <div>
      <div>
        <select onChange={handleChange} defaultValue={intlContext?.locale}>
          {names.map((name) => (
            <option key={name?.lang} value={name?.lang}>
              {langTitles[name?.lang]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default LangSwitcher;
