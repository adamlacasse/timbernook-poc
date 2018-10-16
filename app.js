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

// --------------------------------------------------------------------------

// QUERIES
function selectQuery(){
    database.ref('/programs').on("value", (snapshot) => {
        $('#landing').empty();
        snapshot.forEach(data => {
            $('#landing').append($('<p>').text(`${data.val().name} | ${data.val().date} | $${data.val().cost}`));
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
        cost: $('#ap-cost').val()
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
    if(userInfo){
        selectQuery();
        console.log(`Logged in as ${userInfo.email}`);
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
$('#fileButton').on('change', function(e){
    // get file
    var file = e.target.files[0];

    // create storage reference
    var storageRef = firebase.storage().ref('still_working/' + file.name);

    // Upload file
    var task = storageRef.put(file);

    // update progress bar
    task.on('state_changed', // "state_changed" function comes with three callback options...
        function progress(snapshot) {
            var percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100 ;
            $('#uploader').val(percentage);
        },
        function error(err) {
            console.log(`THERE WAS AN ERROR: ${err}`)
        },
        function complete() {
            task.snapshot.ref.getDownloadURL().then(function(downloadURL) {
                console.log('File available at', downloadURL);
                $('#upload-result').text('UPLOAD COMPLETE :-)');
                setTimeout(function(){
                    $('#upload-result').text('');
                    $('#uploader').val(0);
                    $('#upload-form')[0].reset();
                }, 5000);
                pastePhoto(downloadURL);
            });
        }
    )
})

// function previewImage(file) {

//     if (!file.type.match('/image.*/')) {
//         throw "File Type must be an image";
//     }

//     var thumb = document.createElement("div");
//     thumb.classList.add('thumbnail'); // Add the class thumbnail to the created div

//     var img = document.createElement("img");
//     img.file = file;
//     thumb.appendChild(img);
//     $('#image-preview').appendChild(thumb);

//     // Using FileReader to display the image content
//     var reader = new FileReader();
//     reader.onload = (function(aImg) { return function(e) { aImg.src = e.target.result; }; })(img);
//     reader.readAsDataURL(file);
// }

function pastePhoto(photoURL) {
    $('<img />').attr({
        'src': photoURL,
        'alt': 'this is the alst',
        'title': 'this is the title',
        'width': 250
    }).appendTo('#image-preview');
}

// --------------------------------------------------------------------------

