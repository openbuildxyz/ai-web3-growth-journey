// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract NoteStorage {
    struct NoteInfo {
        string name;
        string cid;
    }

    mapping(address => NoteInfo) private userNotes;

    event NoteStored(address indexed user, string name, string cid);

    function storeNote(string memory name, string memory cid) external {
        require(bytes(name).length > 0, "Name is required");
        require(bytes(cid).length > 0, "CID is required");

        userNotes[msg.sender] = NoteInfo(name, cid);
        emit NoteStored(msg.sender, name, cid);
    }

    function getNote(address user) external view returns (string memory name, string memory cid) {
        NoteInfo memory info = userNotes[user];
        return (info.name, info.cid);
    }
}