import axios from 'axios';
import { BotFormData_T } from './bot_utts';

const { board } = window.miro;

const botFormData: BotFormData_T = {};

async function init() {
  board.ui.on("items:create", async (event) => {
    let card = event['items'][0];
    if(card.type=="shape" || card.type=="sticky_note" || card.type=="text" || card.type=="card"){
      board.remove(card);
      await board.createAppCard({
        x: card.x,
        y: card.y,
        type: 'app_card',
        status: 'connected'
      });
    };
  });

  board.ui.on("app_card:open", async (event) => {
    console.log(event['appCard'].id);
    board.ui.openModal({
      url: `bot_utt_form.html?card_id=${event['appCard'].id}`,
      width: 600,
      height: 400,
      fullscreen: false
    });
    console.log("HJere:");
    //await miro.board.ui.closeModal();
  });
  
  board.ui.on("items:create", async (event) => {
    event['items'].forEach((item) => {
      if(item['type']=="app_card" && item.style.cardTheme == "#2d9bf0"){
        board.ui.openModal({
          url: `choose_bot_cust_block.html?card_id=${item.id}`,
          width: 200,
          height: 200,
          fullscreen: false,
        })
      }
    });
  });

  board.ui.on("icon:click", async () => {
    console.log("here");
    await board.ui.openPanel({ url: "app.html" });
  });
  
}

// Initialize board
init();
