//create variable to hold db connection
let db;
// establish a connection to IndexedDB database called 'transaction-tracker' and set it to version 1
const request = indexedDB.open('transaction-tracker', 1);

// this event will emit if the database version changes (nonexistant to version 1, v1 to v2, etc.)
request.onupgradeneeded = function (event) {
    // save a reference to the database 
    const db = event.target.result;
    // create an object store (table) called `new_item`, set it to have an auto incrementing primary key of sorts 
    db.createObjectStore('new_transaction', { autoIncrement: true });
};

//upon a successful request
request.onsucess = function (event) {
    db = event.target.result;

    //check if app is online and if so, run uploadTransaction() function to send all local db data to api
    if (navigator.onLine) {
        uploadTransaction();
    }
};

request.onerror = function (event) {
    console.log(event.target.errorCode);
};

//if no internet connection
function saveRecord(record) {
    //open a new transaction in db with read & write permissions
    const transaction = db.transaction(['new_transaction'], 'readwrite');

    //access the object store for 'new-transaction'
    const transactionObjectStore = transaction.objectStore('new_transaction');

    //add record to your store with add method
    transactionObjectStore.add(record);
}

function uploadTransaction() {
    //open a transaction on db
    const transaction = db.transaction(['new_transaction'], 'readwrite');

    //access the object store
    const transactionObjectStore = transaction.objectStore('new_transaction');

    //get all records from store and set to a variable
    const getAll = transactionObjectStore.getAll();

    getAll.onsuccess = function () {
        //if there was indexed data in store, send to api server
        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
                .then((response) => response.json())
                .then(serverResponse => {
                    if (serverResponse.message) {
                        throw new Error(serverResponse);
                    }
                    //open one more transaction
                    const transaction = db.transaction(['new_transaction'], 'readwrite');
                    //access to the new_transaction object store
                    const transactionObjectStore = transaction.objectStore('new_transaction');
                    //clear all transactions in your store
                    transactionObjectStore.clear();
                    alert('All transactions have been submitted!');
                })
                .catch(err => {
                    console.log(err);
                });
        }
    }
};

//listen for app coming back online
window.addEventListener('online', uploadTransaction);