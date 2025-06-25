import { Menu, Modal, Input } from "antd";
import { useState } from "react";
import { createNote } from "@/data";

const MenuNotes = ({ notes, setNote, sliderNotesItems, setSliderNotesItems }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    
    const handleNoteClick = (item) => {
        if (item.key === "ADD") {
            setIsModalOpen(true);
        } else {
            const clickedNote = notes.find((n) => n.id === item.key);
            if (clickedNote) {
                setNote(clickedNote);
                setTitle(clickedNote?.title || "");
                setContent(clickedNote?.content || "");
            }
        }
    };

    function handleCancel() {
        setIsModalOpen(false);
        setIsModalTagsOpen(false);
    }

    function handleCreateNote() {
        createNote(title, content)
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

                    setTitle(title);
                    setContent("");
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
                    value={title}
                    onChange={(x) => setTitle(x.target.value)}
                />
            </Modal>
        </>
    )
}

export default MenuNotes;