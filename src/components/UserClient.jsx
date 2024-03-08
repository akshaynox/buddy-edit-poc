import React from "react";
import Avatar from "react-avatar";
import { useIntl } from "react-intl";

const UserClient = ({ username, isCurrentUser }) => {
  const intl = useIntl();

  return (
    <div className="client flex gap-2 items-center">
      <Avatar name={isCurrentUser ? "ME" : username} size={35} round="14px" />
      <span className="userName">
        {isCurrentUser
          ? `${intl.formatMessage({ id: "me" })} (${username})`
          : username}
      </span>
    </div>
  );
};

export default UserClient;
