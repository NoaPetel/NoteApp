import { useState, useEffect } from "react";
import { createNoteTag, deleteTag } from "../../data";
import { Layout, Flex, Input, Button, Modal } from "antd";
import { PlusOutlined } from "@ant-design/icons";

const { Header } = Layout;

const NoteHeader = ({ note, tags = [], noteTags = [] }) => {
  const [title, setTitle] = useState(note?.title ?? "");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSelectedTags, setModalSelectedTags] = useState([]);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
    }
  }, [note]);
  function applyFiltersOnTag(tag) {
    const tagIds = noteTags
      .filter((nt) => nt.noteId === note?.id)
      .map((nt) => nt.tagId);
    return tagIds.includes(tag.id);
  }

  function handleAddTags() {
    if (modalSelectedTags.length > 0 && note) {
      modalSelectedTags.forEach((t) => {
        if (!noteTags.find((nt) => nt.tagId === t && nt.noteId == note.id)) {
          createNoteTag(note.id, t);
        }
      });
    }

    noteTags.forEach((nt) => {
      if (nt.tagId && note) {
        if (nt.noteId === note.id && !modalSelectedTags.includes(nt.tagId)) {
          deleteTag({ id: nt.id });
        }
      }
    });

    setModalSelectedTags([]);
    setIsModalOpen(false);
  }

  function handleAddTagToNote() {
    const modalSelectedTag = noteTags
      .filter((nt) => nt.noteId === note?.id)
      .map((nt) => nt.tagId);
    setModalSelectedTags(modalSelectedTag);
    setIsModalOpen(true);
  }

  function handleCancel() {
    setIsModalOpen(false);
  }

  function handleModalSelectTag(tagId) {
    setModalSelectedTags((prevTags) =>
      prevTags.includes(tagId)
        ? prevTags.filter((id) => id !== tagId)
        : [...prevTags, tagId]
    );
  }

  return (
    <Header
      style={{
        padding: "24px",
      }}
    >
      <Flex
        vertical={true}
        wrap="wrap"
        style={{
          width: "100%",
          gap: "5px",
        }}
      >
        <Input
          id="title"
          placeholder="Enter title"
          value={title}
          onChange={(x) => setTitle(x.target.value)}
        />
        <Flex
          style={{
            alignItems: "center",
            width: "100%",
            height: "32px",
            gap: "5px",
            overflow: "hidden",
            overflowX: "scroll",
            scrollbarWidth: "none",
          }}
        >
          <PlusOutlined onClick={handleAddTagToNote} />
          {tags
            .filter((tag) => applyFiltersOnTag(tag))
            .map((tag) => (
              <Button style={{ minWidth: "70px" }} key={tag.id}>
                {tag.title}
              </Button>
            ))}
        </Flex>
        <Modal
          title="tags"
          open={isModalOpen}
          onOk={handleAddTags}
          onCancel={handleCancel}
        >
          <Flex gap="small">
            {tags.map((tag) => (
              <Button
                color="red"
                variant={modalSelectedTags.includes(tag.id) ? "solid" : "text"}
                key={tag.id}
                onClick={() => handleModalSelectTag(tag.id)}
              >
                {tag.title}
              </Button>
            ))}
          </Flex>
        </Modal>
      </Flex>
    </Header>
  );
};

export default NoteHeader;
