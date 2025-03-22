import { useCallback } from "react";
import { DropzoneOptions, useDropzone } from "react-dropzone";

import style from "./DropzoneInput.module.css";

type DropzoneInputProps = {
  dropzoneOptions?: DropzoneOptions;
  label?: string;
  handleChange: (file: File[]) => void;
  value: File | File[] | null;
}

export default function DropzoneInput({ dropzoneOptions, handleChange, value, label }: Readonly<DropzoneInputProps>) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    handleChange(acceptedFiles);
  }, [handleChange])

  const { getRootProps, getInputProps } = useDropzone({ ...dropzoneOptions, onDrop })

  return (
    <div>
      {label && <p>{label}</p>}
      <div {...getRootProps({ className: style.DropzoneContainer })}>
        <input {...getInputProps()} />
        {
          value ?
            Array.isArray(value)
              ? <p>{value.map((v) => v.name).join(", ")}</p>
              : <p>{value.name}</p>
            : <p>Drop Files</p>
        }
      </div>
    </div>
  )
}