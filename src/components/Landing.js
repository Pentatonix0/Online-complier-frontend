import React, { useEffect, useState } from "react";
import CodeEditorWindow from "./CodeEditorWindow";
import { languageOptions } from "../constants/languageOptions";
import { defineTheme } from "../lib/defineTheme";
import OutputWindow from "./OutputWindow";
import CustomInput from "./CustomInput";
import { classnames } from "../utils/general";
import LanguagesDropdown from "./LanguagesDropdown";
import axios from "axios";
//import { ToastContainer, toast } from "react-toastify";

const pythonDefault = `print("Hello world!")`;

const Landing = () => {
    const [code, setCode] = useState(pythonDefault);
    const [theme, setTheme] = useState({
        value: "oceanic-next",
        label: "Oceanic Next",
    });
    const [language, setLanguage] = useState(languageOptions[37]);
    const [customInput, setCustomInput] = useState("");
    const [outputDetails, setOutputDetails] = useState(null);
    const [processing, setProcessing] = useState(null);
    console.log(language);
    console.log(theme.value);
    console.log(code);
    console.log(customInput);

    const onSelectChange = (sl) => {
        console.log("selected Option...", sl);
        setLanguage(sl);
    };

    const handleCompile = () => {
        setProcessing(true);
        const formData = {
            language_id: language.id,
            // encode source code in base64
            source_code: btoa(code),
            stdin: btoa(customInput),
        };
        const options = {
            method: "POST",
            url: process.env.REACT_APP_RAPID_API_URL + "/compilation/compile",
            WithCredantials: false,
            headers: {
                "content-type": "application/json",
            },
            data: formData,
        };

        axios
            .request(options)
            .then(function (response) {
                console.log("res.data", response.data);
                const token = response.data.token;
                checkStatus(token);
            })
            .catch((err) => {
                let error = err.response ? err.response.data : err;
                // get error status
                let status = err.response.status;
                console.log("status", status);
                setProcessing(false);
                console.log("catch block...", error);
            });
    };

    const checkStatus = async (token) => {
        const options = {
            method: "GET",
            url:
                process.env.REACT_APP_RAPID_API_URL +
                "/compilation/compile/" +
                token,
            WithCredantials: false,
            headers: {},
        };
        try {
            let response = await axios.request(options);
            let statusId = response.data.status?.id;

            // Processed - we have a result
            if (statusId === 1 || statusId === 2) {
                // still processing
                setTimeout(() => {
                    checkStatus(token);
                }, 2000);
                return;
            } else {
                setProcessing(false);
                setOutputDetails(response.data);
                console.log("response.data", response.data);
                return;
            }
        } catch (err) {
            console.log("err", err);
            setProcessing(false);
        }
    };
    useEffect(() => {
        // Вызов defineTheme для загрузки и применения темы
        defineTheme(theme.value)
            .then(() => {
                console.log(`Тема "${theme.value}" успешно загружена!`);
            })
            .catch((error) => {
                console.error("Ошибка при загрузке темы:", error);
            });
    }, [theme.value]); // Эффект сработает при изменении theme.value

    const onChange = (action, data) => {
        switch (action) {
            case "code": {
                setCode(data);
                break;
            }
            default: {
                console.warn("case not handled!", action, data);
            }
        }
    };
    return (
        <>
            <div className="h-4 w-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"></div>
            <div className="flex flex-row">
                <div className="px-4 py-2">
                    <LanguagesDropdown onSelectChange={onSelectChange} />
                </div>
                <div className="px-4 py-2">
                    {/* <ThemeDropdown
                        handleThemeChange={handleThemeChange}
                        theme={theme}
                    /> */}
                </div>
            </div>
            <div className="flex flex-row space-x-4 items-start px-4 py-4">
                <div className="flex flex-col w-full h-full justify-start items-end">
                    <CodeEditorWindow
                        code={code}
                        onChange={onChange}
                        language={language?.value}
                        theme={theme.value}
                    />
                </div>
                <div className="right-container flex flex-shrink-0 w-[30%] flex-col">
                    <OutputWindow outputDetails={outputDetails} />
                    <div className="flex flex-col items-end">
                        <CustomInput
                            customInput={customInput}
                            setCustomInput={setCustomInput}
                        />
                        <button
                            onClick={handleCompile}
                            disabled={!code}
                            className={classnames(
                                "mt-4 border-2 border-black z-10 rounded-md shadow-[5px_5px_0px_0px_rgba(0,0,0)] px-4 py-2 hover:shadow transition duration-200 bg-white flex-shrink-0",
                                !code ? "opacity-50" : ""
                            )}
                        >
                            {processing
                                ? "Processing..."
                                : "Compile and Execute"}
                        </button>
                    </div>
                    {/* {outputDetails && <OutputDetails outputDetails={outputDetails} />} */}
                </div>
            </div>
        </>
    );
};
export default Landing;
