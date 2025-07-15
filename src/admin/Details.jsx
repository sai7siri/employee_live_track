
import { useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./admin.css";

const Details = ({
  selectedUser,
  setSelectedUser,
  users,
  page,
  pageSize,
  totalCount,
  handleNext,
  handlePrev,
  date
}) => {
  useEffect(() => {
    if (!selectedUser && !selectedUser) {
      setSelectedUser(users[0]);
    }
  }, [users]);

  const isSearchResultOnly = selectedUser && users.length === 0;

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.text(`Check-In Users for ${date}`, 14, 15);

    const tableData = (isSearchResultOnly ? [selectedUser] : users).map((user, idx) => [
      idx + 1,
      user.name,
      user.email,
      new Date(user.checkInTime).toLocaleTimeString(),
      user.checkOutTime ? new Date(user.checkOutTime).toLocaleTimeString() : "--"
    ]);

    autoTable(doc, {
      startY: 20,
      head: [["S.No", "Name", "Email", "Check-In", "Check-Out"]],
      body: tableData
    });

    doc.save(`CheckIn_Users_${date}.pdf`);
  };


  return (
    <>
      <div className="d-flex justify-content-end pt-4 ">
        <button className="btn btn-outline-success btn-sm" onClick={handleDownloadPDF}>
          ⬇ Download PDF
        </button>
      </div>

      <div className="table-responsive mt-3 overflow-x-auto">
        <table className="table table-bordered table-sm table-hover">
          <thead className="table-light">
            <tr>
              <th>S.No</th>
              <th>Name</th>
              <th>Email</th>
              <th>Check-In</th>
              <th>Check-Out</th>
            </tr>
          </thead>
          <tbody>
            {isSearchResultOnly ? (
              <tr
                key={selectedUser.id}
                className="table-dark text-white custom-hover-row"
              >
                <td>1</td>
                <td>{selectedUser.name}</td>
                <td>{selectedUser.email}</td>
                <td>{new Date(selectedUser.checkInTime).toLocaleTimeString()}</td>
                <td>
                  {selectedUser.checkOutTime
                    ? new Date(selectedUser.checkOutTime).toLocaleTimeString()
                    : "--"}
                </td>
              </tr>
            ) : users.length > 0 ? (
              users.map((user, idx) => (
                <tr
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  style={{ cursor: "pointer" }}
                  className={`${
                    selectedUser?.id === user.id ? "table-dark text-white" : ""
                  } custom-hover-row`}
                >
                  <td>{(page - 1) * pageSize + idx + 1}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{new Date(user.checkInTime).toLocaleTimeString()}</td>
                  <td>
                    {user.checkOutTime
                      ? new Date(user.checkOutTime).toLocaleTimeString()
                      : "--"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center text-muted">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {(!isSearchResultOnly || users.length > 0) && (
        <div className="d-flex justify-content-between align-items-center mt-4">
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={handlePrev}
            disabled={page === 1}
          >
            ⬅ Prev
          </button>
          <span className="bg-primary w-50 py-1 text-white text-center rounded-2">
            Showing {(page - 1) * pageSize + 1}-
            {Math.min(page * pageSize, totalCount)} of {totalCount}
          </span>
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={handleNext}
            disabled={page * pageSize >= totalCount}
          >
            Next ➡
          </button>
        </div>
      )}
    </>
  );
};

export default Details;
