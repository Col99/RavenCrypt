//string Constants that are used throughout the server.. gather HERE so we don't have to manually change every file later.

var constants = {};

//common
constants.serverIsBusy = "SERVER_IS_BUSY";
constants.syntaxIncorrect = "SYNTAX_INCORRECT";
constants.systemException = "SYSTEM_EXCEPTION";
constants.userNotFound = "USER_NOT_FOUND";
constants.incorrectUserNameFormat = "INCORRECT_USER_NAME_FORMAT";
constants.incorrectServerFormat = "INCORRECT_SERVER_FORMAT";
constants.senderReceiverAreSame = "SENDER_NEEDS_TO_BE_DIFFERENT_FROM_RECEIVER";

global.constants = constants;
