import { useState } from "react";
import DropzoneInput from "../Inputs/DropzoneInput/DropzoneInput";
import style from "./SecretSanta.module.css";

export default function SecretSanta() {
  const [employeeFile, setEmployeeFile] = useState<File | null>(null);
  const [previousFile, setPreviousFile] = useState<File | null>(null);

  const handleEmployeeFileChange = (file: File[]) => {
    setEmployeeFile(file[0]);
  }

  const handlePreviousFileChange = (file: File[]) => {
    setPreviousFile(file[0]);
  }

  return (
    <div className={style.Container}>
      <DropzoneInput label="Employees List" handleChange={handleEmployeeFileChange} value={employeeFile} />
      <DropzoneInput label="Previous Data" handleChange={handlePreviousFileChange} value={previousFile} />
      <button className={style.DownloadBtn} disabled={!employeeFile || !previousFile}>Download Result</button>
    </div>
  )
}