import os
import xml.etree.ElementTree as ET
import json
import requests
from typing import List, Dict

class UGDRepositoryHarvester:
    def __init__(self):
        # Base OAI-PMH endpoint for Goce Delčev University
        self.base_url = "https://eprints.ugd.edu.mk/cgi/oai2"
        self.namespaces = {
            'oai': 'http://www.openarchives.org/OAI/2.0/',
            'dc': 'http://purl.org/dc/elements/1.1/'
        }
        # Targeted fiscal and economic terms in Macedonian
        self.search_keywords = [
            "фискална децентрализација",
            "фискален капацитет",
            "финансиска дисциплина",
            "општински долг",
            "локална самоуправа"
        ]

    def harvest_records(self, metadata_prefix: str = "oai_dc") -> List[Dict]:
        """Harvests records from the OAI-PMH endpoint and filters by fiscal keywords."""
        params = {
            "verb": "ListRecords",
            "metadataPrefix": metadata_prefix
        }
        
        harvested_data = []
        print(f"📡 Initiating OAI-PMH harvest from: {self.base_url}...")
        
        try:
            response = requests.get(self.base_url, params=params, timeout=30)
            if response.status_code != 200:
                print(f"❌ Connection Failure: HTTP {response.status_code}")
                return []
            
            root = ET.fromstring(response.content)
            records = root.findall('.//oai:record', self.namespaces)
            
            for record in records:
                metadata = record.find('.//oai:metadata', self.namespaces)
                if metadata is None:
                    continue
                
                # Extract Dublin Core metadata fields safely
                title_node = metadata.find('.//dc:title', self.namespaces)
                desc_node = metadata.find('.//dc:description', self.namespaces)
                subj_nodes = metadata.findall('.//dc:subject', self.namespaces)
                id_nodes = metadata.findall('.//dc:identifier', self.namespaces)
                
                title = title_node.text if title_node is not None else ""
                description = desc_node.text if desc_node is not None else ""
                subjects = [node.text for node in subj_nodes if node.text is not None]
                urls = [node.text for node in id_nodes if node.text and node.text.startswith("http")]

                # Combine text fields to scan for targeted fiscal criteria
                search_blob = (title + " " + description + " " + " ".join(subjects)).lower()
                
                # Match against your fiscal matrix keywords
                if any(keyword in search_blob for keyword in self.search_keywords):
                    record_payload = {
                        "title": title.strip(),
                        "description": description.strip(),
                        "subjects": subjects,
                        "resource_urls": urls
                    }
                    harvested_data.append(record_payload)
                    print(f"✅ Found Matching Resource: {title[:60]}...")
                    
            return harvested_data

        except Exception as e:
            print(f"❌ Error executing harvest loop: {str(e)}")
            return []

    def export_to_json(self, data: List[Dict], filename: str = "ugd_fiscal_meta.json"):
        """Compiles the raw results into clean JSON objects for the agentic workspace."""
        if not data:
            print("⚠️ No relevant data discovered. Aborting export.")
            return
            
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"💾 Successfully exported {len(data)} raw records into {filename}")

if __name__ == "__main__":
    harvester = UGDRepositoryHarvester()
    # Execute the technical harvest pipeline
    matched_papers = harvester.harvest_records()
    harvester.export_to_json(matched_papers)
