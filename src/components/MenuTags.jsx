import { Menu, Modal, Input, Flex, Typography } from "antd";
import { useState } from "react";
import { AlignCenterOutlined, TagOutlined, PlusOutlined, CloseOutlined } from "@ant-design/icons";
import { deleteTag, createTag } from "@/data";

const { Text } = Typography;

const MenuTags = ({ tags, noteTags, notes, setSliderNotesItems, setTags }) => {
    const [isModalTagsOpen, setIsModalTagsOpen] = useState(false);
    const [tagTitle, setTagTitle] = useState("");

    const items = [
        {
            key: "1",
            icon: <AlignCenterOutlined />,
            label: "Notes",
        },
        {
            key: "tags",
            icon: <TagOutlined />,
            label: "Tags",
            children: [
                ...tags.map((tag) => ({
                    key: tag.id,
                    label: (
                        <Flex
                            justify="space-between"
                            align="center"
                            style={{ position: 'relative' }}
                            onMouseEnter={(e) => e.currentTarget.querySelector('.delete-icon').style.display = 'block'}
                            onMouseLeave={(e) => e.currentTarget.querySelector('.delete-icon').style.display = 'none'}
                        >
                            <Text>{tag.title}</Text>
                            <CloseOutlined
                                className="delete-icon"
                                onClick={(e) => {
                                    handleDeleteTag(tag.id);
                                }}
                                style={{
                                    marginLeft: 8,
                                    display: 'none',
                                    position: 'absolute',
                                    right: 0,
                                    padding: '2px',
                                    backgroundColor: '#EEEEEE',
                                    borderRadius: '15%',
                                }}
                            />
                        </Flex>
                    ),
                })),
                {
                    key: "ADD",
                    icon: <PlusOutlined />,
                    label: "Add a new tag",
                },
            ],
        },
    ];

    function handleCreateTag() {
        createTag(tagTitle)
            .then((response) => {
                if (response.data) {
                    const newTag = response.data;
                    setTags((prevValue) => [
                        {
                            key: newTag.id,
                            label: newTag.title,
                        },
                        ...prevValue,
                    ]);
                    setTagTitle("");
                    setIsModalTagsOpen(false);
                }
            })
            .catch((error) => console.log("Error while creating the notes", error));
    };

    const handleMenuClick = (tagMenu) => {
        if (tagMenu.key === "ADD") {
            setIsModalTagsOpen(true);
        } else {
            const selectedNotesTags = noteTags.filter(
                (nt) => nt.tagId === tagMenu.key
            );
            const selectedNoteIds = selectedNotesTags.map((nt) => nt.noteId);
            let selectedNotes = notes.filter((n) => selectedNoteIds.includes(n.id));
            if (!(selectedNotes.length > 0)) selectedNotes = [];
            if (tagMenu.key === "1") selectedNotes = notes;
            const menuItems = selectedNotes.map((note) => ({
                key: note.id,
                label: note.title,
            }));
            const newMenuItems = [
                ...menuItems,
                {
                    key: "ADD",
                    icon: <PlusOutlined />,
                    label: "Add a new note",
                },
            ];
            setSliderNotesItems(newMenuItems);
        }
    };

    const handleDeleteTag = (tagId) => {
        deleteTag(tagId);
    };

    const handleCancel = () => {
        setIsModalTagsOpen(false);
    }

    return (
        <>
            <Menu
                className="main_slider"
                style={{
                    overflow: "hidden",
                    overflowY: "auto",
                    height: "100%",
                    scrollbarWidth: "thin",
                }}
                mode="inline"
                defaultSelectedKeys={["1"]}
                items={items}
                onClick={handleMenuClick}
            />
            <Modal
                title="Tag"
                open={isModalTagsOpen}
                onOk={handleCreateTag}
                onCancel={handleCancel}
            >
                <Input
                    id="title"
                    placeholder="Enter title"
                    value={tagTitle}
                    onChange={(x) => setTagTitle(x.target.value)}
                />
            </Modal>
        </>
    )
}

export default MenuTags;