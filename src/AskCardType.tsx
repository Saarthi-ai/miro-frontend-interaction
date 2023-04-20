import * as React from 'react';
import ReactDOM from 'react-dom';
import { get_card_id,} from "./bot_utts";
//import { AppCard } from "@mirohq/websdk-types";

const context: any = {}; //await miro.board.createAppCard();

const AppCardData = React.createContext(context);

function CardType() {
    const appCardData = React.useContext(AppCardData);
    const [CrdType, setCrdType] = React.useState("bot_slot");
    const [Status, setStatus] = React.useState("Selecting");

    function handleSubmit(event: any){
        event.preventDefault();
        setStatus("Submitted");
    }
    
    React.useEffect(() =>{
        if(Status=="Submitted"){
            if(CrdType=="bot_slot"){
                appCardData.style.cardTheme = "#00FF00";
            }
            else if(CrdType=="cust_action"){
                appCardData.style.cardTheme = "#FFA500"
            }
            (async () => await appCardData.sync())();
            miro.board.ui.closeModal();
        }
    }, [Status]);

    return (
        <div>
            <h3>Type of Card</h3>
            <br/>
            <form>
                <label className="radiobutton">
                    <input type="radio" name="radio" defaultChecked onChange={() => setCrdType("bot_slot")}/>
                    <span>Bot Slot</span>
                </label>
                <label className="radiobutton">
                    <input type="radio" name="radio" onChange={()=>setCrdType("cust_action")}/>
                    <span>Customer Action</span>
                </label>
                <button type="submit" className="button button-primary" onClick={handleSubmit}>Submit</button>
            </form>
        </div>
    )
}

const card_id = get_card_id(window.location.search);
let app_card = await miro.board.getById(card_id);

ReactDOM.render(
    <React.StrictMode>
        <AppCardData.Provider value={app_card}>
            <CardType />
        </AppCardData.Provider>
    </React.StrictMode>,
    document.getElementById('root')
)