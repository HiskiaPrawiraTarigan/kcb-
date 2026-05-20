import zipfile
import xml.etree.ElementTree as ET
import sys

def extract_text_from_pptx(pptx_path):
    text_runs = []
    try:
        with zipfile.ZipFile(pptx_path, 'r') as z:
            for filename in z.namelist():
                if filename.startswith('ppt/slides/slide') and filename.endswith('.xml'):
                    xml_content = z.read(filename)
                    tree = ET.fromstring(xml_content)
                    for node in tree.iter():
                        if node.tag.endswith('}t'):
                            text = node.text
                            if text:
                                text_runs.append(text)
    except Exception as e:
        return f"Error: {e}"
    
    return '\n'.join(text_runs)

if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    if len(sys.argv) > 1:
        print(extract_text_from_pptx(sys.argv[1]))
    else:
        print("Usage: python extract_pptx.py <file.pptx>")
