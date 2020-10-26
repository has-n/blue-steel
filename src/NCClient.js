const {
    Client,
    Server,
    UploadFilesCommand,
    CommandStatus
} = require("nextcloud-node-client");
const Store = require("electron-store");

const store = new Store();

async function createClient() {
    //TODO: validate that user has saved NextCloud credentials
    const server = new Server({
        basicAuth: {
            username: store.get("nextCloudUser"),
            password: store.get("nextCloudPass"),
        },
        url: store.get("nextCloudURL")
    });
    console.log(server);
    const client = new Client(server);
    //let si = await client.getSystemInfo();
    //console.log(si);
    return client;
}

async function uploadFile(file) {
    const client = await createClient();
    console.log(client);
    const files = [{
        sourceFileName: file.filePath,
        targetFileName: "/Videos/" + file.tempFileName,
    }];

    const uc = new UploadFilesCommand(client, {
        files
    });
    uc.execute();

    while (uc.isFinished() !== true) {
        // wait one second
        await (async () => {
            return new Promise(resolve => setTimeout(resolve, 1000));
        })();
        console.log(uc.getPercentCompleted() + "%");
    }


    const uploadResult = uc.getResultMetaData();
    if (uc.getStatus() === CommandStatus.success) {
        console.log(uploadResult.messages);
        console.log(uc.getBytesUploaded());
    } else {
        console.log(uploadResult.errors);
    }
}

module.exports.uploadFile = uploadFile;