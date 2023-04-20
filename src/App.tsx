import * as React from "react";
import ReactDOM from "react-dom";
import axios from "axios";

function App() {
  
  const [inputText, setInputText] = React.useState("")

  const submitBot = async () => {
    const board = window.miro.board;
    const data = await board.getInfo();
    const user_info = await board.getUserInfo();
    
    try {
      const res = await axios.post(`https://b615-216-48-183-17.in.ngrok.io/create_bot?userId=${user_info.id}&botName=${inputText}&url=${data.id}/`,
                                   {data : ''},
                                   {headers: {"accept": "application/json"}}
                                  )
    } catch (err) {
    
      console.log('error from axios-->', err)
    
    }


  };

  return (
    <div >
      <div className="cs1 ce12">
        <p className="p-medium">
          Type the name of the bot, and click "Submit Bot" to submit and deploy a new bot, on Discord.
        </p>
      </div>
      <form className="form">
        <div className="cs1 ce12">
          <h4 className="h4">Bot Name</h4>
        </div>
        <input className="inputBox" type="text" id="bot_name_inp" onChange={(e) => { setInputText(e.target.value) }} />
      </form>

      <div className="cs1 ce12">
        <button
          className="button button-primary"
          onClick={submitBot}
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
