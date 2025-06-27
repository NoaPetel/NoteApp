import { Menu, Modal, Input } from "antd";
import { useState } from "react";
import { createNote } from "@/data";

const MenuNotes = ({ notes, setNote, sliderNotesItems, setSliderNotesItems }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [title, setTitle] = useState("");
    
    const [modalTitle, setModalTitle] = useState("");

    const handleNoteClick = (item) => {
        if (item.key === "ADD") {
            setIsModalOpen(true);
        } else {
            const clickedNote = notes.find((n) => n.id === item.key);
            if (clickedNote) {
                setNote(clickedNote);
                setTitle(clickedNote?.title || "");
            }
        }
    };

    function handleCancel() {
        setIsModalOpen(false);
    }

    function handleCreateNote() {
        createNote(modalTitle)
            .then((response) => {
                if (response.data) {
                    const newNote = response.data;
                    setSliderNotesItems((prevValue) => [
                        {
                            key: newNote.id,
                            label: newNote.title,
                        },
                        ...prevValue,
                    ]);

                    setTitle(modalTitle);
                    setModalTitle("");
                    setIsModalOpen(false);
                    setNote(newNote);
                }
            })
            .catch((err) => console.error("Error while creating the notes", err));
    }


    return (
        <>
            <Menu
                mode="inline"
                style={{ height: "100%" }}
                defaultSelectedKeys={["1"]}
                items={sliderNotesItems}
                onClick={handleNoteClick}
            />
            <Modal
                title="Note"
                open={isModalOpen}
                onOk={handleCreateNote}
                onCancel={handleCancel}
            >
                <Input
                    id="title"
                    placeholder="Enter title"
                    value={modalTitle}
                    onChange={(x) => setModalTitle(x.target.value)}
                />
            </Modal>
        </>
    )
}

export default MenuNotes;