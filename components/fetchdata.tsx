import { useEffect } from "react";

type FetchDataProps = {
  sendData: (data: any) => void;
};

export default function FetchData({ sendData }: FetchDataProps): null {
  useEffect(() => {
    fetch('http://192.168.100.69:3000/Products')
      .then(res => res.json())
      .then(data => sendData(data))
      .catch(error => {
        console.error("Fetch error:", error);
      });
  }, [sendData]);

  return null;
}
