// firebase.ts
import { initializeApp } from 'firebase/app'
import {
	getStorage,
	ref,
	uploadBytesResumable,
	getDownloadURL,
} from 'firebase/storage'

const firebaseConfig = {
	apiKey: 'AIzaSyANPrHUfZdb8RGWMlZhuqj3gO6UXlq681w',
	authDomain: 'museum-65f7f.firebaseapp.com',
	projectId: 'museum-65f7f',
	storageBucket: 'museum-65f7f.firebasestorage.app',
	messagingSenderId: '132764283510',
	appId: '1:132764283510:web:f8db5b4e071b4bfde5a557',
	measurementId: 'G-10W2Y40DL5',
}

const app = initializeApp(firebaseConfig)
const storage = getStorage(app)

export { storage }
