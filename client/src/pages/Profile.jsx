import {useSelector} from 'react-redux';
import { useRef, useState, useEffect } from 'react';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { app } from '../firebase.js';

export default function Profile() {
  const fileRef = useRef(null);
  const {currentUser} = useSelector((state) => state.user);
  const [file, setFile] = useState(undefined);
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [formData, setFormData] = useState({});
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    if (file) {
      handleFileUpload(file);
    }
  }, [file]);

  useEffect(() => {
    if (filePerc === 100) {
      // Show the success message with a delay
      setShowSuccessMessage(false);
      const timer = setTimeout(() => {
        setShowSuccessMessage(true);
      }, 2500); // 2-second delay

      return () => clearTimeout(timer); // Cleanup timeout on unmount or when filePerc changes
    }
  }, [filePerc]);

  const handleFileUpload = (file) => {
    const storage = getStorage(app);
    const fileName = `RealEstate/${new Date().getTime()}_${file.name}`;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setFilePerc(Math.round(progress));
      },
      (error) => {
        setFileUploadError(true);
      },
      ()=>{
        getDownloadURL(uploadTask.snapshot.ref).then
        ((downloadURL) => 
            setFormData({ ...formData, avatar: downloadURL })
        );
      }
    );
  };

  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl font-semibold text-center my-7'>Profile</h1>
      <form className='flex flex-col gap-4'>
        <input onChange={(e)=>{setFileUploadError(false); setFile(e.target.files[0]);}} type="file" ref={fileRef} hidden accept='image/*'/>
        <img onClick={()=>fileRef.current.click()} src={formData.avatar || currentUser.avatar} alt="profile" className='rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2' />
        <p className='text-sm self-center'>
          {fileUploadError ? <span className='text-red-700'>Error in Image Upload (Image must be less than 2 MB)</span> :
            ((filePerc > 0) && (filePerc < 100)) ? (
              <span className='text-slate-700'>
                {`Uploading ${filePerc}%`}
              </span>) :
              (filePerc === 100 && showSuccessMessage) ? (
                <span className='text-green-700'>
                  Image Successfully Uploaded!
                </span>
              ) :
              ("")
        }
        </p>
        <input type="text" placeholder='username' id='username' className='border p-3 rounded-lg'  />
        <input type="email" placeholder='email' id='email' className='border p-3 rounded-lg'  />
        <input type="text" placeholder='password' id='password' className='border p-3 rounded-lg'  />
        <button className='bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80'>update</button>

      </form>
      <div className="flex justify-between mt-5">
        <span className='text-red-700 cursor-pointer'>Delete account</span>
        <span className='text-red-700 cursor-pointer'>Sign out</span>
      </div>
    </div>
  )
}