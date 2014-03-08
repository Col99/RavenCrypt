## PhoneToRCService

This should be a NodeJS service that bridges the PhoneNrs and RCAddresses.

Its purpose is to put PhonNrs behind RC-Addresses via SMS confirmation.

### Info

It should primarily act as a lookup for RC addresses behind phone numbers.

It should NEVER become necessary to have a phone number behind an RC address.

This server should be run on a central installment, like ravencrypt.org and should be publicly funded,
with full source and funding published.


Routes:

POST:/insert

    IN: {number: "00491234567890", address: "lol@@@rc.net"}

    OUT: 200:true/400:false   (also used for updates}

POST:/confirm

    IN: "123456"

    OUT: 200:true/400:false

POST:/lookup/

    IN: {PhoneNr}

    OUT: 200:"lol@@@rc.net"/400:false  (this should return the confirmed Rc-Addresses)

POST:/lookupReverse/

    IN: {RC-Address, e.g. lol@@@rc.net}

    OUT: 200:"PhoneNr"/400:false (this should return the confirmed phone Nr.)


Thats it.
