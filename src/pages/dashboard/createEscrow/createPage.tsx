import Layout from "../layout/layout";
import CreateEscrow from "./EscrowForm";

const CreateLink = () => {
    return ( <>
    <div className="min-h-screen bg-gray-800 font-sans text-gray-100 flex relative overflow-hidden">
     <Layout active="Manage Escrows"/>
     <CreateEscrow/>
    </div>


    </> );
}
 
export default CreateLink;