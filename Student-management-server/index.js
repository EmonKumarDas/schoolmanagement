const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
app.use(express.json());
const port = 5000;


const firebase = require('firebase-admin');
const serviceAccount = require('./bdflix-f2281-firebase-adminsdk-kif2f-1e3bc57c48.json');
firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: "https://school-management-14f81-default-rtdb.firebaseio.com"
});


//firebase*************************************************

const multer = require("multer");
const firebaseapp = require("firebase/app");
const { getStorage, ref, uploadBytes, getDownloadURL } = require("firebase/storage");

const firebaseConfig = {
    apiKey: "AIzaSyCkgL95f7nu7nHCa88Ze0WedmLe7jVs-eg",
    authDomain: "school-management-14f81.firebaseapp.com",
    databaseURL: "https://school-management-14f81-default-rtdb.firebaseio.com",
    projectId: "school-management-14f81",
    storageBucket: "school-management-14f81.appspot.com",
    messagingSenderId: "629277737357",
    appId: "1:629277737357:web:e4609cd0a0dd0968393dc4",
    measurementId: "G-X1NLFK3PP7"
  };
  
firebaseapp.initializeApp(firebaseConfig);
const storage = getStorage()
const upload = multer({ storage: multer.memoryStorage() });



// upload image------------------------------------------------------------------------

app.post('/uploadPhoto', upload.single("imageFile"), async (req, res) => {
    try {
    const storageRef = ref(storage, req.file.originalname);
    const metadata = {
    contentType: 'image/jpeg'
    };
    await uploadBytes(storageRef, req.file.buffer, metadata);
    const url = await getDownloadURL(storageRef);
    res.send({ url });
    } catch (error) {
    console.error(error);
    res.status(500).send(error);
    }
    });

//firebase**********************************************************************

const student = firebase.database();

app.get('/', (req, res) => {
    res.send("Hello");
})

// sent student's info to the database

app.post('/students', (req, res) => {
    if (!student || !req.body) {
        res.status(400).send('Bad Request');
        return;
    }
    const data = req.body;
    const id = Math.floor(Math.random() * 1000000);
    student.ref(`/students/${id}`).once('value', (snapshot) => {
        if (snapshot.exists()) {
            res.status(500).send('Error: Student with this id already exists');
        } else {
            student.ref(`/students/${id}`).set(data, (error) => {
                if (error) {
                    res.status(500).send(error);
                } else {
                    res.status(201).send(`Data created successfully with id: ${id}`);
                }
            });
        }
    });
});

// get all students
app.get("/students", (req, res) => {
    student.ref("/students").once("value", snapshot => {
        const students = snapshot.val();
        const studentsArray = Object.entries(students).map(([id, data]) => ({
            id,
            ...data
        }));
        res.send(studentsArray);
    });
});

// get data by student id
app.get('/getstudents/:id', (req, res) => {
const id = req.params.id;
student.ref(`/students/${id}`).once('value', (snapshot) => {
if (snapshot.exists()) {
const student = snapshot.val();
student.id = id;
res.status(200).send(student);
} else {
res.status(404).send('Not found');
}
});
});

// delete student by id
app.delete('/deletestudents/:id', (req, res) => {
    const id = req.params.id;
    student.ref(`/students/${id}`).once('value', (snapshot) => {
        if (snapshot.exists()) {
            student.ref(`/students/${id}`).remove((error) => {
                if (error) {
                    res.status(500).send({ error: 'Failed to delete student' });
                } else {
                    res.status(200).send({ message: `Student with id ${id} was deleted successfully` });
                }
            });
        } else {
            res.status(404).send({ error: 'Not found' });
        }
    });
});



app.put('/updatestudent/:id', (req, res) => {
    const studentId = req.params.id;
    if (!studentId || !req.body) {
        res.status(400).send('Bad Request: Missing student id or request body');
        return;
    }
    const studentRef = student.ref(`students/${studentId}`);
    studentRef.update(req.body, (error) => {
        if (error) {
            res.status(500).send(`Update failed: ${error}`);
            return;
        }
        res.send(`Student data updated successfully`);
    });
});



app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})