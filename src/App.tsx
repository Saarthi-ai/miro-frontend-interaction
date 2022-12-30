import * as React from "react";
import ReactDOM from "react-dom";
import axios from "axios";

function App() {
  // const { board } = window.miro.board;

  const [inputText, setInputText] = React.useState("")

  const handleInsertCalendar = async () => {
    // console.log(board, { window })
    const board = window.miro.board;
    const data = await board.getInfo();
    const user_info = await board.getUserInfo()
    console.log(user_info.id)
    try {
      // const response = await axios({ data: { botName: inputText, url: data.id }, method: 'post', url: "http://localhost:8000/create_bot" });
      const res = await axios.post(`http://localhost:8000/create_bot?userId=${user_info.id}&botName=${inputText}&url=${data.id}/`,
                                   {data : ''},
                                   {headers: {"accept": "application/json"}}
                                  )
      console.log('axios res -->', res)
    } catch (err) {
      console.log('error from axios-->', err)
    }


  };

  return (
    <div >
      <div className="cs1 ce12">
        <p className="p-medium">
          Type the name of the bot, and click "Generate Bot" to generate and deploy a new bot, on Discord.
        </p>
      </div>
      <form className="form">
        <div className="cs1 ce12">
          <h4 className="h4">Bot Name</h4>
        </div>
        <input className="inputJee" type="text" id="bot_name_inp" onChange={(e) => { setInputText(e.target.value) }} />
      </form>

      <div className="cs1 ce12">
        <button
          className="button button-primary"
          onClick={handleInsertCalendar}
        >
          Submit Bot
        </button>
      </div>
    </div>
  );
}

// Render App
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
