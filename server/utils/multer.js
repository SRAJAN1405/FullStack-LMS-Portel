import multer from 'multer';       //to study more about this

const upload =multer({dest: 'uploads/'});
export default upload;