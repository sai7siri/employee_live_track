import LiveMap from "./LiveMap";
import UserInfoCard from "./UserInfoCard.jsx";
import GetAddressButton from "./GetAddressButton.jsx";




const UserDashboard = () => {
 

  return (
    <div className="container-fluid mt-3 overflow-auto py-5">
      <div className="row gap-4 gap-sm-0">
        {/* LEFT PANEL */}
        <div className="col-md-4">
          <UserInfoCard />
          <GetAddressButton />
        </div>

        {/* RIGHT PANEL */}
        <div className="col-md-8 px-4 mb-4 mb-sm-0 ">
          <LiveMap />
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
