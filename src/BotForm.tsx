import * as React from "react";
import ReactDOM from "react-dom";
import { get_card_id,} from "./bot_utts";
//import { AppCard } from "@mirohq/websdk-types";
import hindiLetter from "./assets/hindi-letter.svg";

const context: any = {}; //AppCard = await miro.board.createAppCard();

const AppCardData = React.createContext(context);

function BotForm() {
    const appCardData = React.useContext(AppCardData);
    
    const [Status, setStatus] = React.useState('Typing');

    let init_botUtt = appCardData.title??''
    const [botUtt, setbotUtt] = React.useState(init_botUtt)
    
    let init_hindiBotUtt = ''
    if(appCardData.fields && appCardData.fields.length>0){
        init_hindiBotUtt = appCardData.fields[0].tooltip??'';
    }
    const [botUttHindi, setbotUttHindi] = React.useState(init_hindiBotUtt);
    
    React.useEffect(() => {
            if(Status=="Updated"){
                appCardData.title = botUtt;
                if(appCardData.fields === undefined || botUttHindi==""){
                    appCardData.fields = [];
                }
                else{
                    appCardData.fields[0] = {
                                             value: 'Hindi',
                                             iconUrl: hindiLetter,
                                             iconShape: 'round', 
                                             tooltip: botUttHindi,
                                             fillColor: '#FBE983',
                                             textColor: '#F83A22',
                                            };
                }
                (async () => await appCardData.sync())();
                miro.board.ui.closeModal();
            }
            else if(Status=="Cancelled"){
                miro.board.ui.closeModal();
            }
    },
    [Status])

    async function handleUpdate(event: any){
        event.preventDefault();
        setStatus('Updated');
    }

    async function handleCancel(event: any){
        event.preventDefault();
        setStatus('Cancelled');
    }

    return (
        <div id="bot_form">
            <form>
                <label>Bot Utterance
                    <input type="text" value={botUtt} onChange={(event) => setbotUtt(event.target.value)} className="input"/>
                </label>
                <br/>
                <br/>
                <label>Hindi Bot Utterance
                    <input type="text" value={botUttHindi} onChange={(event) => setbotUttHindi(event.target.value)}  className="input"/>
                </label>
                <br/>
                <br/>
                    <button type="submit" onClick={handleUpdate} className="button button-primary"> Update </button>
                    <button type="submit" onClick={handleCancel} className="button"> Cancel</button>
            </form>
        </div>
    );
}


const card_id = get_card_id(window.location.search);
const app_card = await miro.board.getById(card_id);

if(app_card['type'] == 'app_card'){
    
    ReactDOM.render(
        <React.StrictMode>
            <AppCardData.Provider value={app_card}>
                <BotForm/>
            </AppCardData.Provider>
        </React.StrictMode>,
        document.getElementById("root")
    );
}