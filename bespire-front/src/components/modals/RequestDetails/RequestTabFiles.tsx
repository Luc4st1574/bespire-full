/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRequestContext } from "@/context/RequestContext";
import FilesSectionTab from "../../file_manager/FilesSectionTab";



export default function RequestTabFiles({ request }: any) {
  const { isBlocked } = useRequestContext();
  
  return (
    <div className="p-6 flex flex-col gap-4">
      <FilesSectionTab 
        linkedToId={request.id} 
        linkedToType="request" 
        disabled={isBlocked}
      />
    </div>
  );
}
