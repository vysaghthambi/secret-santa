import { useState } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import DropzoneInput from "../Inputs/DropzoneInput/DropzoneInput";

import style from "./SecretSanta.module.css";

type EmployeeType = {
  Employee_Name: string;
  Employee_EmailID: string;
}

type SecretChildType = EmployeeType & {
  Secret_Child_EmailID: string;
  Secret_Child_Name: string;
}

export default function SecretSanta() {
  const [employeeFile, setEmployeeFile] = useState<File | null>(null);
  const [previousFile, setPreviousFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleEmployeeFileChange = (file: File[]) => {
    setEmployeeFile(file[0]);
  }

  const handlePreviousFileChange = (file: File[]) => {
    setPreviousFile(file[0]);
  }

  const getParsedData = (file: File) => {
    return new Promise((resolve, reject) => {
      const fileExtension = file.name.split(".").pop()?.toLowerCase();

      if (fileExtension === "csv") {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (res) => {
            console.log(res)
            resolve(res.data)
          },
          error: (err) => {
            reject(new Error(err.message));
          }
        })
      } else if (fileExtension === "xlsx") {
        const reader = new FileReader();
        reader.onload = (e) => {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const parsedData = XLSX.utils.sheet_to_json(sheet);
          resolve(parsedData);
        };
        reader.readAsArrayBuffer(file);
      } else {
        reject(new Error("Invalid File extension"));
      }
    })
  }

  const handleDownload = async () => {
    if (!employeeFile) {
      window.alert("Please upload both files");
      return;
    }

    try {
      setIsLoading(true);

      const [employees, previousData = []] = await Promise.all([
        getParsedData(employeeFile) as Promise<EmployeeType[]>,
        ...(previousFile ? [getParsedData(previousFile) as Promise<SecretChildType[]>] : [])
      ])

      const maxAttempts = 5;
      let retries = 0;

      while (retries < maxAttempts) {
        const availableEmployees = [...employees];

        const assignments: SecretChildType[] = [];
        const assignedChildren: Set<string> = new Set();
        let valid = true;

        for (const employee of employees) {
          const possibleChildren = availableEmployees.filter((child) => (
            child.Employee_EmailID !== employee.Employee_EmailID &&
            !previousData.some((data) => (
              data.Employee_EmailID === employee.Employee_EmailID &&
              data.Secret_Child_EmailID === child.Employee_EmailID
            )) &&
            !assignedChildren.has(child.Employee_EmailID)
          ))

          if (possibleChildren.length === 0) {
            valid = false;
            break;
          }

          const secretChild = possibleChildren[Math.floor(Math.random() * possibleChildren.length)];
          assignedChildren.add(secretChild.Employee_EmailID);

          assignments.push({
            Employee_EmailID: employee.Employee_EmailID,
            Employee_Name: employee.Employee_Name,
            Secret_Child_EmailID: secretChild.Employee_EmailID,
            Secret_Child_Name: secretChild.Employee_Name
          })
        }

        if (valid) {
          const worksheet = XLSX.utils.json_to_sheet(assignments);
          const workbook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(workbook, worksheet, "Assignments");
          const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
          const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
          saveAs(blob, "SecretSantaAssignments.xlsx");

          return;
        }

        retries++;
      }
    } catch (error) {
      console.error(error);
      window.alert("Something went wrong!")
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={style.Container}>
      <DropzoneInput
        label="Employees List"
        handleChange={handleEmployeeFileChange}
        value={employeeFile}
        dropzoneOptions={{
          accept: {
            "text/csv": [".csv"],
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"]
          }
        }}
      />
      <DropzoneInput
        label="Previous Data"
        handleChange={handlePreviousFileChange}
        value={previousFile}
        dropzoneOptions={{
          accept: {
            "text/csv": [".csv"],
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"]
          }
        }}
      />
      <button
        className={style.DownloadBtn}
        disabled={!employeeFile || isLoading}
        onClick={handleDownload}
      >
        {
          isLoading
            ? "Generating.."
            : "Download Result"
        }
      </button>
    </div>
  )
}