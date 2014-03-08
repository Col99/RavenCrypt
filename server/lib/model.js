var modelPath = __dirname + "/model/";

global.model = {};

function importModel(modName){
    return require(modelPath + modName);
}

importModel("modelBlog.js");
importModel("modelCommunication.js");
importModel("modelContact.js");
importModel("modelContactKey.js");
importModel("modelContactRelation.js");
importModel("modelHashTag.js");
importModel("modelFile.js");
importModel("modelMessage.js");
importModel("modelServerSessionKey.js");
importModel("modelUser.js");
importModel("modelUserKey.js");
importModel("modelUserLogin.js");
importModel("modelUserProfile.js");
importModel("modelUserRegister.js");