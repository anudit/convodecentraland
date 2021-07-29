  // NOTE: remember to add &ENABLE_WEB3 to the url when running locally
import * as EthereumController from "@decentraland/EthereumController"

class Convo {

    initializedState: boolean;
    state: any;
    cube: Entity;

    constructor(){

        this.initializedState = false;
        this.state = {
            data : [],
            authToken : "",
        };
        this.cube = new Entity();
    }

    async updateMessages(){
        let response = await fetch('https://theconvo.space/api/comments?url=https%3A%2F%2Ftheconvo.space%2F&latestFirst=true&page=0&pageSize=5&apikey=CONVO')
        let json = await response.json();
        log('initializedState', this.initializedState);
        if (this.initializedState === false) {
            this.initializedState = true;
            log('setting up', json);
            this.state.data = json;
            this.cube.addComponentOrReplace(
                new Transform({
                    position: new Vector3(4, 1, 8),
                    rotation: Quaternion.Euler(0, 90, 0)
                })
            );
            const myText = new TextShape(decodeURIComponent(json[0].text));
            this.cube.addComponent(myText);
            engine.addEntity(this.cube);
        }
        else {
            if (this.state.data[0]['_id'] != json[0]._id){
                log('New Update found', decodeURIComponent(json[0].text));
                this.cube.getComponent(TextShape).value = decodeURIComponent(json[0].text);
            }
            else {
                log('nothing to update.');
            }
        }
    }

    async auth(){
        try {
            const address = await EthereumController.getUserAccount();
            const timestamp = Date.now();

            const messageToSign = `# DCL Signed message
            I allow this site to access my data on The Convo Space using the account ${address}. Timestamp:${timestamp}`;

            const convertedMessage = await EthereumController.convertMessageToObject(messageToSign);
            const { message, signature } = await EthereumController.signMessage(convertedMessage);

            log({ message, signature })

          } catch (error) {
            log(error.toString())
          }
    }
}


const baseScene = new Entity();
engine.addEntity(baseScene);
baseScene.addComponent(new GLTFShape("models/scene.glb"));

const convo = new Convo();

convo.auth();

setInterval(async ()=>{
    convo.updateMessages();
}, 3000);
