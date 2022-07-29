import React from "react";
import Header from "./components/Header";
import Resume from "./components/Resume";
import Form from "./components/Form";
import GlobalStyle from "./styles/global";

const App = () => {
    return (
        <>
            <Header />
            <Resume />
            <Form />
            <GlobalStyle />
        </>
    );
};

export default App;