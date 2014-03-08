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

//Session
constants.sessionSyntaxIncorrect = "SESSION_SYNTAX_INCORRECT";
constants.sessionBadUpload = "BAD_UPLOAD";
constants.sessionKeyNotFound = "SESSION_KEY_NOT_FOUND";
constants.sessionDecryptionFailed = "SESSION_DECRYPTION_FAILED";
constants.sessionExpired = "SESSION_EXPIRED";
constants.reqHasNoSession = "REQUEST_HAS_NO_SESSION";
constants.reqIsNotJson = "REQUEST_IS_NOT_JSON";

//Register
constants.userExsits = "USER_EXISTS";
constants.nameInUse = "NAME_IN_USE";
constants.msgCanNotBeValidated = "MSG_CAN_NOT_VALIDATED";
constants.noValidSignature = "NO_VALID_SIGNATURE";
constants.activationCodeIsNoPGPMsg = "ACTIVATION_CODE_IS_NO_PGP_MSG";
constants.noRegistrationFound = "NO_REGISTRATION_FOUND";
constants.unreadableKey = "UNREADABLE_KEY";
constants.keyCanNotSign = "KEY_CAN_NOT_SIGN";
constants.keyCanNotEncrypt = "KEY_CAN_NOT_ENCRYPT";

//login
constants.userOrKeyNotFound = "USER_OR_KEY_NOT_FOUND";
constants.noLoginKey = "NO_LOGIN_KEY";


constants.noPGPMsg = "NO_PGG_MSG";


global.constants = constants;
