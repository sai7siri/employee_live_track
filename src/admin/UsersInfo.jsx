import React, { useEffect, useRef, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  startAfter,
  getCountFromServer,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../services/firebase";
import "./admin.css";
import Details from "./Details";
import { useStoreContext } from "../store/ContextStore";
import { toast } from "react-toastify";

const getTodayDateString = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const pageSize = 5;

const UsersInfo = () => {
  const { users, setUsers, selectedUser, setSelectedUser } = useStoreContext();
  const prevDataRef = useRef({});
  const [unsubscribeListener, setUnsubscribeListener] = useState(null);


  const [date, setDate] = useState(getTodayDateString());
  const [nameInput, setNameInput] = useState("");
  const [autocompleteNames, setAutocompleteNames] = useState([]);
  const [openAuto, setOpenAuto] = useState(false);

  const [lastDoc, setLastDoc] = useState(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

 const fetchUsersByDate = async (selectedDate, startAfterDoc = null, realTime = true) => {
  if (unsubscribeListener) {
    unsubscribeListener(); // Clear previous listener
    setUnsubscribeListener(null);
  }

  let baseQuery = query(
    collection(db, "usersCheckins"),
    where("date", "==", selectedDate),
    orderBy("checkInTime", "desc"),
    limit(pageSize)
  );

  if (startAfterDoc) {
    baseQuery = query(baseQuery, startAfter(startAfterDoc));
  }

  // If today and first page => use real-time updates
  const isToday = selectedDate === getTodayDateString();
  if (realTime && isToday && !startAfterDoc) {
    const unsubscribe = onSnapshot(baseQuery, async (snapshot) => {
      const fetchedUsers = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // ✅ Toast Check
      fetchedUsers.forEach((user) => {
        const prev = prevDataRef.current[user.id];
        const now = user;

        if (!prev && !now.isCheckedOut) {
          toast.success(`${now.name} just checked in at ${new Date(now.checkInTime).toLocaleTimeString()}`);
        }

        if (prev && !prev.isCheckedOut && now.isCheckedOut) {
          toast.info(`${now.name} just checked out at ${new Date(now.checkOutTime).toLocaleTimeString()}`);
        }
      });

      const updatedMap = {};
      fetchedUsers.forEach((u) => {
        updatedMap[u.id] = u;
      });
      prevDataRef.current = updatedMap;

      setUsers(fetchedUsers);
      if (!selectedUser && fetchedUsers.length > 0) {
        setSelectedUser(fetchedUsers[0]);
      }

      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);

      const countSnap = await getCountFromServer(
        query(collection(db, "usersCheckins"), where("date", "==", selectedDate))
      );
      setTotalCount(countSnap.data().count);
      setPage(1);
    });

    setUnsubscribeListener(() => unsubscribe);
    return;
  }

  // Else use normal getDocs (non-realtime)
  const snapshot = await getDocs(baseQuery);
  const fetchedUsers = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  setUsers(fetchedUsers);
  if (!selectedUser && fetchedUsers.length > 0) {
    setSelectedUser(fetchedUsers[0]);
  }

  setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);

  const countSnap = await getCountFromServer(
    query(collection(db, "usersCheckins"), where("date", "==", selectedDate))
  );
  setTotalCount(countSnap.data().count);
  if (!startAfterDoc) setPage(1);
};


  const fetchUserByName = async (selectedDate, userName) => {
    try {
      const q = query(
        collection(db, "usersCheckins"),
        where("date", "==", selectedDate),
        where("name", "==", userName.toLowerCase())
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setSelectedUser(null);
        setUsers([]);
      } else {
        const doc = snapshot.docs[0];
        setSelectedUser({ id: doc.id, ...doc.data() });
        setUsers([]);
      }
    } catch (error) {
      console.error("Error fetching user by name:", error);
      setOpenAuto(false);
    }
  };

  useEffect(() => {
    const fetchNames = async () => {
      if (!date || nameInput.length < 2) {
        setAutocompleteNames([]);
        return;
      }

      try {
        const q = query(
          collection(db, "usersCheckins"),
          where("date", "==", date),
          orderBy("name"),
          where("name", ">=", nameInput.toLowerCase()),
          where("name", "<=", nameInput.toLowerCase() + "\uf8ff"),
          limit(5)
        );
        const snapshot = await getDocs(q);
        const names = snapshot.docs.map((doc) => doc.data().name);
        setAutocompleteNames(names);
      } catch (error) {
        console.error("Error fetching autocomplete names:", error);
      }
    };

    fetchNames();
  }, [nameInput, date , ]);

  useEffect(() => {
    if (date) {
      fetchUsersByDate(date);
      setNameInput("");
      setSelectedUser(null);
    }
  }, [date]);

  useEffect( ()=>{
    if(unsubscribeListener){
      unsubscribeListener();
    }
  } , [unsubscribeListener])

  const handleNameSelect = (name) => {
    setNameInput(name);
    setAutocompleteNames([]);
    fetchUserByName(date, name);
    setOpenAuto(false);
  };

  const handleNext = () => {
    if (lastDoc) {
      fetchUsersByDate(date, lastDoc , false);
      setPage((p) => p + 1);
    }
  };

  const handlePrev = () => {
    if (page > 1) {
      fetchUsersByDate(date , null , false);
      setPage((p) => p - 1);
    }
  };

  const handleNameInputChange = (e) => {
    setOpenAuto(true);
    const val = e.target.value;
    setNameInput(val);
    if (val === "") {
      fetchUsersByDate(date);
      setSelectedUser(null);
    }
  };

  const handleReset = () => {
    setNameInput("");
    fetchUsersByDate(date , null , false);
    setSelectedUser(null);
  };

  return (
    <div style={{ height: "550px"}}>
    <div className="p-3 border border-dark rounded-1 mb-3">
      <h5 className="text-center mb-4"> Employee Tracking Details</h5>

      <div className="d-flex w-100 justify-content-center align-items-center ">
        <div className="w-50">
          <label htmlFor="date" className="text-start">
            Select Date
          </label>
          <input
            id="date"
            type="date"
            className="form-control mb-3 border border-info"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            />
        </div>

        <div className="pt-2 ps-1">
          <button
            className="btn btn-outline-secondary"
            onClick={() => setDate(getTodayDateString())}
            >
            Today
          </button>
        </div>
      </div>

      <div className="position-relative mb-3 d-flex justify-content-center align-items-center gap-2">
        <input
          type="text"
          className="form-control w-50 border border-info"
          placeholder="Search by name"
          value={nameInput}
          onChange={handleNameInputChange}
          disabled={!date}
          autoComplete="off"
          />
        <button className="btn btn-outline-danger" onClick={handleReset}>
          Reset
        </button>
        {openAuto && autocompleteNames.length > 0 && (
          <ul className="custom-autocomplete-list">
            {autocompleteNames.map((name, idx) => (
              <li
              key={idx}
              className="custom-autocomplete-item"
              onClick={() => handleNameSelect(name)}
              >
                {name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <Details
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        users={users}
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
        handleNext={handleNext}
        handlePrev={handlePrev}
        date={date}
        />
    </div>
        </div>
  );
};

export default UsersInfo;
