import React from "react";
import UsersInfo from "./UsersInfo";
import UsersMap from "./UsersMap";

const AdminDashboard = () => {
 

  return (
    <div className="container-fluid overflow-auto py-3">
      <div className="row gap-3 gap-sm-0 ">
        {/* left - usersInfo */}
        <div className="col-md-6 overflow-auto mb-3 mb-md-0">
          <UsersInfo />
        </div>

        {/* right-map */}
        <div className="col-md-6">
          <UsersMap />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
