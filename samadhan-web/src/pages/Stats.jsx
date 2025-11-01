import React, { useState } from "react";
import PortalStats from "./PortalStats";
import Footer from "./Footer";

const Stats = () => {
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  // Pass setLastUpdate to PortalStats so it can update on submit
  return (
    <div>
      <PortalStats setLastUpdate={setLastUpdate} />
      <Footer lastUpdate={lastUpdate} />
    </div>
  );
};

export default Stats;
