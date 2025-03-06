import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { Button, Modal, Input, Layout, Menu, theme } from "antd";
import { CloseOutlined, HeartFilled, PlusOutlined } from "@ant-design/icons";

const { Header, Sider, Footer } = Layout;

const client = generateClient<Schema>();

function App() {
  const [notes, setNotes] = useState<Array<Schema["Note"]["type"]>>([]);
  const [tags, setTags] = useState<Array<Schema["Tag"]["type"]>>([]);
  const [noteTags, setNoteTags] = useState<Array<Schema["NoteTag"]["type"]>>(
    []
  );
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [modalSelectedTags, setModalSelectedTags] = useState<string[]>([]);

  const [collapsed, setCollapsed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isModalTagsOpen, setIsModalTagsOpen] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [tagTitle, setTagTitle] = useState<string>("");
  const [note, setNote] = useState<Schema["Note"]["type"]>();
  const [isFiltered, setIsFiltered] = useState<boolean>(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const { user, signOut } = useAuthenticator();

  useEffect(() => {
    try {
      client.models.Note.observeQuery().subscribe({
        next: (data) => setNotes([...data.items]),
      });
      client.models.Tag.observeQuery().subscribe({
        next: (data) => setTags([...data.items]),
        error: (error) => console.error("Error fetching tags", error),
      });
      client.models.NoteTag.observeQuery().subscribe({
        next: (data) => setNoteTags([...data.items]),
        error: (error) => console.error("Error fetching Notetags", error),
      });
    } catch (err) {
      console.error("Error while fetching data", err);
    }
  }, []);

  function showModalCreate() {
    setIsModalOpen(true);
  }

  function showModalTags(noteId: string) {
    const n = notes.find((note) => note.id === noteId);
    const nt = noteTags.filter((nt) => nt.noteId === noteId);
    const selectedTagIds = nt
      .map((x) => x.tagId)
      .filter(
        (tagId): tagId is string => tagId !== null && tagId !== undefined
      );
    setNote(n);
    setModalSelectedTags(selectedTagIds);
    setIsModalTagsOpen(true);
  }

  function showModalUpdate(id: string) {
    const n = notes.find((note) => note.id === id);
    setNote(n);
    if (note) {
      setTitle(note?.title || "");
      setContent(note.content ? note.content : "");
      setIsModalOpen(true);
    } else {
      console.log("Note not found");
    }
  }

  function handleCancel() {
    setNote(undefined);
    setModalSelectedTags([]);
    setIsModalOpen(false);
    setIsModalTagsOpen(false);
  }

  function handleCreate() {
    if (note) {
      client.models.Note.update({ id: note.id, title, content });
    } else {
      client.models.Note.create({ title, content });
    }
    setTitle("");
    setContent("");
    setIsModalOpen(false);
  }

  function deleteNote(id: string) {
    if (id) {
      client.models.Note.delete({ id: id });
    }
  }

  function addToFavorite() {
    if (note) {
      client.models.Note.update({ id: note.id, favorite: !note?.favorite });
    }
  }

  function applyFilters() {
    setIsFiltered(!isFiltered);
  }

  function createTag() {
    client.models.Tag.create({ title: tagTitle });
  }

  function handleAddTags() {
    if (modalSelectedTags.length > 0 && note) {
      modalSelectedTags.forEach((t) => {
        if (!noteTags.find((nt) => nt.tagId === t && nt.noteId == note.id)) {
          client.models.NoteTag.create({ noteId: note.id, tagId: t });
        }
      });
    }

    noteTags.forEach((nt) => {
      if (nt.tagId && note) {
        if (nt.noteId === note.id && !modalSelectedTags.includes(nt.tagId)) {
          client.models.NoteTag.delete({ id: nt.id });
        }
      }
    });

    setModalSelectedTags([]);
    setIsModalTagsOpen(false);
  }

  function handleModalSelectTag(tagId: string) {
    setModalSelectedTags((prevTags) =>
      prevTags.includes(tagId)
        ? prevTags.filter((id) => id !== tagId)
        : [...prevTags, tagId]
    );
  }

  function handleSelectedTag(tagId: string) {
    setSelectedTags((prevTags) =>
      prevTags.includes(tagId)
        ? prevTags.filter((id) => id !== tagId)
        : [...prevTags, tagId]
    );
  }

  function applyNotesFilter(noteId: string) {
    const tagIds = noteTags
      .filter((nt) => nt.noteId === noteId)
      .map((nt) => nt.tagId);

    return selectedTags.every((id) => tagIds.includes(id || ""));
  }

  return (
    <Layout className="main_layout">
      <Sider
        className="sidebar"
        trigger={null}
        collapsible
        collapsed={collapsed}
      >
        <Menu
          mode="inline"
          selectedKeys={selectedTags}
          items={tags.map((tag) => ({
            key: tag.id, // Unique key for each menu item
            label: tag.title,
            // style: {
            //   backgroundColor: selectedTags.includes(tag.id) ? "red" : "white",
            // },
            onClick: () => handleSelectedTag(tag.id), // Handle selection
          }))}
        >
          <main>
            <div className="tag_div">
              <Input
                id="tagTitle"
                placeholder="New tag"
                value={tagTitle}
                onChange={(x) => setTagTitle(x.target.value)}
              />
              <Button onClick={createTag}> Create Tag </Button>
              <ul>
                {tags.map((tag) => (
                  <li
                    className="tag_list_element"
                    style={{
                      backgroundColor: selectedTags.includes(tag.id)
                        ? "red"
                        : "white",
                    }}
                    key={tag.id}
                    onClick={() => handleSelectedTag(tag.id)}
                  >
                    {tag.title}
                  </li>
                ))}
              </ul>
            </div>
            <Button onClick={showModalCreate}>+ new</Button>
            <Button className="small_button" onClick={applyFilters}>
              Show favorite
            </Button>
            <Modal
              title="Note"
              open={isModalOpen}
              onOk={handleCreate}
              onCancel={handleCancel}
              footer={(_, { OkBtn, CancelBtn }) => (
                <>
                  {note && (
                    <Button
                      color="default"
                      variant="text"
                      onClick={addToFavorite}
                    >
                      Favorite
                    </Button>
                  )}
                  <CancelBtn />
                  <OkBtn />
                </>
              )}
            >
              <Input
                id="title"
                placeholder="Enter title"
                value={title}
                onChange={(x) => setTitle(x.target.value)}
              />
              <Input
                id="content"
                placeholder="Enter Content"
                value={content}
                onChange={(x) => setContent(x.target.value)}
              />
            </Modal>
            <ul>
              {notes
                .filter((note) => applyNotesFilter(note.id))
                .map((note) => (
                  <div className="list_wrapper" key={note.id}>
                    <li onClick={() => showModalUpdate(note.id)}>
                      {note.title}
                    </li>
                    <div className="list_element_2">
                      <CloseOutlined onClick={() => deleteNote(note.id)} />
                    </div>
                    <div className="list_element_3">
                      {note.favorite && <HeartFilled color="red" />}
                    </div>
                    <div className="list_element_3">
                      <PlusOutlined onClick={() => showModalTags(note.id)} />
                      <Modal
                        title="tags"
                        open={isModalTagsOpen}
                        onOk={handleAddTags}
                        onCancel={handleCancel}
                      >
                        {tags.map((tag) => (
                          <Button
                            color="red"
                            variant={
                              modalSelectedTags.includes(tag.id)
                                ? "solid"
                                : "text"
                            }
                            key={tag.id}
                            onClick={() => handleModalSelectTag(tag.id)}
                          >
                            {tag.title}
                          </Button>
                        ))}
                      </Modal>
                    </div>
                  </div>
                ))}
            </ul>
            <div>
              🥳 App successfully hosted. Try creating a new note.
              <br />
            </div>
          </main>
        </Menu>
      </Sider>
      <Layout>
        <Header>
          <h1>{user?.signInDetails?.loginId}'s Notes App</h1>
          <button onClick={signOut}> Sign out</button>
        </Header>
      </Layout>
    </Layout>
  );
}

export default App;
