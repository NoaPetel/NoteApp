import NoteBody from "@/components/note-content/NoteBody";
import NoteHeader from "@/components/note-content/NoteHeader";
import { Layout } from "antd";

const NoteContent = ({ note, tags, noteTags, setSliderNotesItems }) => {
  if (!note) {
    return <></>;
  } else {
    return (
      <Layout>
        <NoteHeader note={note} tags={tags} noteTags={noteTags} />
        <NoteBody
          note={note}
          setSliderNotesItems={setSliderNotesItems}
        />
      </Layout>
    );
  }
};

export default NoteContent;
