var config = {
    apiKey: "AIzaSyDqM96DQL3V6Hc94P1uBAGyWiML-moreWM",
    authDomain: "gitslacked2.firebaseapp.com",
    databaseURL: "https://gitslacked2.firebaseio.com",
    projectId: "gitslacked2",
    storageBucket: "gitslacked2.appspot.com",
    messagingSenderId: "515555071574"
}
firebase.initializeApp(config);
const database = firebase.database();
const auth = firebase.auth();

// DEV-----------------------------------------------------------------------

$('#user-info-button').on('click', () => {
    console.log(`Thanks for clicking the button. Here's your data: ${JSON.stringify(auth.currentUser)}`);
});

// --------------------------------------------------------------------------

// QUERIES
function selectQuery() {
    console.log('this is the selectQuery');
    database.ref('/programs').on("value", (snapshot) => {
        $('#landing').empty();
        snapshot.forEach(data => {
            $('#landing').append($('<p>').text(`${data.val().name} | ${data.val().date} | $${data.val().cost}`));
        });
    });
    database.ref('/images').on("value", (snapshot) => {
        $('#photos').empty();
        snapshot.forEach(data => {
            data.forEach(i => {
                const formattedPhoto = JSON.stringify(i).replace(/['"]+/g, '');
                pastePhoto(formattedPhoto, '#photos');
            })
        });
    });
}

$('#add-program-form').on('submit', (e) => {
    e.preventDefault();
    database.ref('/programs').push({
        name: $('#ap-name').val(),
        date: $('#ap-date').val(),
        time: $('#ap-time').val(),
        seats: $('#ap-seats').val(),
        cost: $('#ap-cost').val(),
        uid: auth.currentUser.uid
    });
    $('#add-program-form')[0].reset();
});

// --------------------------------------------------------------------------

// AUTHENTICATION SHIZ
$('#sign-up-form').on('submit', e => {
    e.preventDefault();
    const email = $('#sign-up-email').val();
    const pass = $('#sign-up-password').val();
    const promise = auth.createUserWithEmailAndPassword(email, pass);
    promise.catch(e => console.log(e.message));
    $('#sign-up-form')[0].reset();
});

$('#log-in-form').on('submit', e => {
    e.preventDefault();
    const email = $('#log-in-email').val();
    const pass = $('#log-in-password').val();
    const promise = auth.signInWithEmailAndPassword(email, pass);
    promise.catch(e => console.log(e.message));
    $('#log-in-form')[0].reset();
});

firebase.auth().onAuthStateChanged(userInfo => {
    if (userInfo) {
        setTimeout(() => {
            selectQuery();
        }, 5000);
        console.log(`Logged in as ${userInfo.uid}`);
        $('#auth-div').hide();
        $('#log-out-button').show();
        $('#program-shiz').show();
    } else {
        console.log("not logged in")
        $('#auth-div').show();
        $('#log-out-button').hide();
        $('#program-shiz').hide();
    }
});

$('#log-out-button').on('click', () => {
    auth.signOut();
});

// --------------------------------------------------------------------------

// STORAGE

// Listen for file selection
$('#fileButton').on('change', function (e) {
    // get file
    var file = e.target.files[0];

    // create storage reference
    var storageRef = firebase.storage().ref('still_working/' + file.name);

    // Upload file
    var task = storageRef.put(file);

    // update progress bar
    task.on('state_changed', // "state_changed" function comes with three callback options...
        function progress(snapshot) {
            var percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            $('#uploader').val(percentage);
        },
        function error(err) {
            console.log(`THERE WAS AN ERROR: ${err}`)
        },
        function complete() {
            task.snapshot.ref.getDownloadURL().then(function (downloadURL) {
                console.log('File available at', downloadURL);
                imageToDB(downloadURL);
                $('#upload-result').text('UPLOAD COMPLETE :-)');
                setTimeout(function () {
                    $('#upload-result').text('');
                    $('#uploader').val(0);
                    $('#upload-form')[0].reset();
                }, 5000);
                pastePhoto(downloadURL, '#image-preview');
            });
        }
    )
});

function imageToDB(url) {
    database.ref('/images').push({
        imageLink: url
    });
}

function pastePhoto(photoURL, element) {
    $('<img />').attr({
        src: photoURL,
        alt: 'this is the alt',
        title: 'this is the title',
        width: 250,
        a: 'https://www.google.com/search?q=baset+weaving&oq=baset+weaving' // can maybe pass in a link to the Program page (here, or in #landing section)
    }).appendTo(element);
}

// --------------------------------------------------------------------------

