interface _FormData {
    bot_utt : string| undefined;
    bot_utt_hindi: string | undefined;
}

export type BotFormData_T = {[card_id: string]: _FormData}

export function get_card_id(url: string): string{
    let card_id = (new URLSearchParams(url)).get('card_id');
    if(card_id === null){
        throw new Error(`Card id not found in url: ${url}`);
    }
    return card_id;
}