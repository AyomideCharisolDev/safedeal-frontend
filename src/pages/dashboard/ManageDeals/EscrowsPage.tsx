import Layout from "../layout/layout";
import ManageEscrows from "./table";

const EscrowsPage = () => {
    return ( <>
    <div className="min-h-screen bg-gray-800 font-sans text-gray-100 flex relative overflow-hidden">
     <Layout active="Manage Escrows"/>
     <ManageEscrows/>
    </div>


    </> );
}
 
export default EscrowsPage;