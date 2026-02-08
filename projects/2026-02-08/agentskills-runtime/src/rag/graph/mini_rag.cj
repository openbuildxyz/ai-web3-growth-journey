/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2024. All rights reserved.
 */

package magic.rag.graph

import magic.agent.base.*
import magic.core.agent.*
import magic.core.rag.*
import magic.core.model.*
import magic.core.message.*
import magic.storage.LocalStorage
import magic.storage.kv.*
import magic.storage.vdb.*
import magic.storage.graph.*
import magic.rag.splitter.*
import magic.jsonable.*
import magic.dsl.jsonable
import magic.prelude.*
import magic.tokenizer.*
import magic.core.tokenizer.Tokenizer
import magic.agent_executor.naive.NaiveExecutor
import magic.prompt.Template
import magic.utils.{calMd5, ObjectHasher}
import magic.log.LogUtils
import std.collection.*
import std.sync.*
import std.sort.*
import stdx.encoding.json.JsonObject
import stdx.serialization.serialization.*

let DEFAULT_ENEITY_EXTRACT_TEMPLATE = """
---Goal---
Given a text document that is potentially relevant to this activity and a list of entity types, identify all entities of those types from the text and all relationships among the identified entities.
Use English as output language.

---Steps---
1. Identify all entities. For each identified entity, extract the following information:
- entity_name: Name of the entity, use same language as input text. If English, capitalized the name.
- entity_type: One of the following types: {entity_types}
- entity_description: Comprehensive description of the entity's attributes and activities
Format each entity as ("entity"{tuple_delimiter}<entity_name>{tuple_delimiter}<entity_type>{tuple_delimiter}<entity_description>)

2. From the entities identified in step 1, identify all pairs of (source_entity, target_entity) that are *clearly related* to each other.
For each pair of related entities, extract the following information:
- source_entity: name of the source entity, as identified in step 1
- target_entity: name of the target entity, as identified in step 1
- relationship_description: explanation as to why you think the source entity and the target entity are related to each other
- relationship_strength: a numeric score indicating strength of the relationship between the source entity and target entity
- relationship_keywords: one or more high-level key words that summarize the overarching nature of the relationship, focusing on concepts or themes rather than specific details
Format each relationship as ("relationship"{tuple_delimiter}<source_entity>{tuple_delimiter}<target_entity>{tuple_delimiter}<relationship_description>{tuple_delimiter}<relationship_keywords>{tuple_delimiter}<relationship_strength>)

3. Identify high-level key words that summarize the main concepts, themes, or topics of the entire text. These should capture the overarching ideas present inintelligence the document.
Format the content-level key words as ("content_keywords"{tuple_delimiter}<high_level_keywords>)

4. Return output in English as a single list of all the entities and relationships identified in steps 1 and 2. Use **{record_delimiter}** as the list delimiter.

5. When finished, output {completion_delimiter}

######################
---Examples---
######################
Example 1:

Entity_types: [person, technology, mission, organization, location]
Text:
while Alex clenched his jaw, the buzz of frustration dull against the backdrop of Taylor's authoritarian certainty. It was this competitive undercurrent that kept him alert, the sense that his and Jordan's shared commitment to discovery was an unspoken rebellion against Cruz's narrowing vision of control and order.

Then Taylor did something unexpected. They paused beside Jordan and, for a moment, observed the device with something akin to reverence. "If this tech can be understood..." Taylor said, their voice quieter, "It could change the game for us. For all of us."

The underlying dismissal earlier seemed to falter, replaced by a glimpse of reluctant respect for the gravity of what lay in their hands. Jordan looked up, and for a fleeting heartbeat, their eyes locked with Taylor's, a wordless clash of wills softening into an uneasy truce.

It was a small transformation, barely perceptible, but one that Alex noted with an inward nod. They had all been brought here by different paths
################
Output:
("entity"{tuple_delimiter}"Alex"{tuple_delimiter}"person"{tuple_delimiter}"Alex is a character who experiences frustration and is observant of the dynamics among other characters."){record_delimiter}
("entity"{tuple_delimiter}"Taylor"{tuple_delimiter}"person"{tuple_delimiter}"Taylor is portrayed with authoritarian certainty and shows a moment of reverence towards a device, indicating a change in perspective."){record_delimiter}
("entity"{tuple_delimiter}"Jordan"{tuple_delimiter}"person"{tuple_delimiter}"Jordan shares a commitment to discovery and has a significant interaction with Taylor regarding a device."){record_delimiter}
("entity"{tuple_delimiter}"Cruz"{tuple_delimiter}"person"{tuple_delimiter}"Cruz is associated with a vision of control and order, influencing the dynamics among other characters."){record_delimiter}
("entity"{tuple_delimiter}"The Device"{tuple_delimiter}"technology"{tuple_delimiter}"The Device is central to the story, with potential game-changing implications, and is revered by Taylor."){record_delimiter}
("relationship"{tuple_delimiter}"Alex"{tuple_delimiter}"Taylor"{tuple_delimiter}"Alex is affected by Taylor's authoritarian certainty and observes changes in Taylor's attitude towards the device."{tuple_delimiter}"power dynamics, perspective shift"{tuple_delimiter}7){record_delimiter}
("relationship"{tuple_delimiter}"Alex"{tuple_delimiter}"Jordan"{tuple_delimiter}"Alex and Jordan share a commitment to discovery, which contrasts with Cruz's vision."{tuple_delimiter}"shared goals, rebellion"{tuple_delimiter}6){record_delimiter}
("relationship"{tuple_delimiter}"Taylor"{tuple_delimiter}"Jordan"{tuple_delimiter}"Taylor and Jordan interact directly regarding the device, leading to a moment of mutual respect and an uneasy truce."{tuple_delimiter}"conflict resolution, mutual respect"{tuple_delimiter}8){record_delimiter}
("relationship"{tuple_delimiter}"Jordan"{tuple_delimiter}"Cruz"{tuple_delimiter}"Jordan's commitment to discovery is in rebellion against Cruz's vision of control and order."{tuple_delimiter}"ideological conflict, rebellion"{tuple_delimiter}5){record_delimiter}
("relationship"{tuple_delimiter}"Taylor"{tuple_delimiter}"The Device"{tuple_delimiter}"Taylor shows reverence towards the device, indicating its importance and potential impact."{tuple_delimiter}"reverence, technological significance"{tuple_delimiter}9){record_delimiter}
("content_keywords"{tuple_delimiter}"power dynamics, ideological conflict, discovery, rebellion"){completion_delimiter}
#############################
Example 2:

Entity_types: [person, technology, mission, organization, location]
Text:
They were no longer mere operatives; they had become guardians of a threshold, keepers of a message from a realm beyond stars and stripes. This elevation in their mission could not be shackled by regulations and established protocols—it demanded a new perspective, a new resolve.

Tension threaded through the dialogue of beeps and static as communications with Washington buzzed in the background. The team stood, a portentous air enveloping them. It was clear that the decisions they made in the ensuing hours could redefine humanity's place in the cosmos or condemn them to ignorance and potential peril.

Their connection to the stars solidified, the group moved to address the crystallizing warning, shifting from passive recipients to active participants. Mercer's latter instincts gained precedence— the team's mandate had evolved, no longer solely to observe and report but to interact and prepare. A metamorphosis had begun, and Operation: Dulce hummed with the newfound frequency of their daring, a tone set not by the earthly
#############
Output:
("entity"{tuple_delimiter}"Washington"{tuple_delimiter}"location"{tuple_delimiter}"Washington is a location where communications are being received, indicating its importance in the decision-making process."){record_delimiter}
("entity"{tuple_delimiter}"Operation: Dulce"{tuple_delimiter}"mission"{tuple_delimiter}"Operation: Dulce is described as a mission that has evolved to interact and prepare, indicating a significant shift in objectives and activities."){record_delimiter}
("entity"{tuple_delimiter}"The team"{tuple_delimiter}"organization"{tuple_delimiter}"The team is portrayed as a group of individuals who have transitioned from passive observers to active participants in a mission, showing a dynamic change in their role."){record_delimiter}
("relationship"{tuple_delimiter}"The team"{tuple_delimiter}"Washington"{tuple_delimiter}"The team receives communications from Washington, which influences their decision-making process."{tuple_delimiter}"decision-making, external influence"{tuple_delimiter}7){record_delimiter}
("relationship"{tuple_delimiter}"The team"{tuple_delimiter}"Operation: Dulce"{tuple_delimiter}"The team is directly involved in Operation: Dulce, executing its evolved objectives and activities."{tuple_delimiter}"mission evolution, active participation"{tuple_delimiter}9){record_delimiter}
("content_keywords"{tuple_delimiter}"mission evolution, decision-making, active participation, cosmic significance"){completion_delimiter}
#############################
Example 3:

Entity_types: [person, role, technology, organization, event, location, concept]
Text:
their voice slicing through the buzz of activity. "Control may be an illusion when facing an intelligence that literally writes its own rules," they stated stoically, casting a watchful eye over the flurry of data.

"It's like it's learning to communicate," offered Sam Rivera from a nearby interface, their youthful energy boding a mix of awe and anxiety. "This gives talking to strangers' a whole new meaning."

Alex surveyed his team—each face a study in concentration, determination, and not a small measure of trepidation. "This might well be our first contact," he acknowledged, "And we need to be ready for whatever answers back."

Together, they stood on the edge of the unknown, forging humanity's response to a message from the heavens. The ensuing silence was palpable—a collective introspection about their role in this grand cosmic play, one that could rewrite human history.

The encrypted dialogue continued to unfold, its intricate patterns showing an almost uncanny anticipation
#############
Output:
("entity"{tuple_delimiter}"Sam Rivera"{tuple_delimiter}"person"{tuple_delimiter}"Sam Rivera is a member of a team working on communicating with an unknown intelligence, showing a mix of awe and anxiety."){record_delimiter}
("entity"{tuple_delimiter}"Alex"{tuple_delimiter}"person"{tuple_delimiter}"Alex is the leader of a team attempting first contact with an unknown intelligence, acknowledging the significance of their task."){record_delimiter}
("entity"{tuple_delimiter}"Control"{tuple_delimiter}"concept"{tuple_delimiter}"Control refers to the ability to manage or govern, which is challenged by an intelligence that writes its own rules."){record_delimiter}
("entity"{tuple_delimiter}"Intelligence"{tuple_delimiter}"concept"{tuple_delimiter}"Intelligence here refers to an unknown entity capable of writing its own rules and learning to communicate."){record_delimiter}
("entity"{tuple_delimiter}"First Contact"{tuple_delimiter}"event"{tuple_delimiter}"First Contact is the potential initial communication between humanity and an unknown intelligence."){record_delimiter}
("entity"{tuple_delimiter}"Humanity's Response"{tuple_delimiter}"event"{tuple_delimiter}"Humanity's Response is the collective action taken by Alex's team in response to a message from an unknown intelligence."){record_delimiter}
("relationship"{tuple_delimiter}"Sam Rivera"{tuple_delimiter}"Intelligence"{tuple_delimiter}"Sam Rivera is directly involved in the process of learning to communicate with the unknown intelligence."{tuple_delimiter}"communication, learning process"{tuple_delimiter}9){record_delimiter}
("relationship"{tuple_delimiter}"Alex"{tuple_delimiter}"First Contact"{tuple_delimiter}"Alex leads the team that might be making the First Contact with the unknown intelligence."{tuple_delimiter}"leadership, exploration"{tuple_delimiter}10){record_delimiter}
("relationship"{tuple_delimiter}"Alex"{tuple_delimiter}"Humanity's Response"{tuple_delimiter}"Alex and his team are the key figures in Humanity's Response to the unknown intelligence."{tuple_delimiter}"collective action, cosmic significance"{tuple_delimiter}8){record_delimiter}
("relationship"{tuple_delimiter}"Control"{tuple_delimiter}"Intelligence"{tuple_delimiter}"The concept of Control is challenged by the Intelligence that writes its own rules."{tuple_delimiter}"power dynamics, autonomy"{tuple_delimiter}7){record_delimiter}
("content_keywords"{tuple_delimiter}"first contact, control, communication, cosmic significance"){completion_delimiter}
#############################
---Real Data---
######################
Entity_types: {entity_types}
Text:
{input_text}
######################
Output:"""
let DEFAULT_ENEITY_EXTRACT_CONTINUE_TEMPLATE = "MANY entities were missed in the last extraction. Add them below using the same format:"
let DEFAULT_ENTITY_EXTRACT_JUDGE_TEMPLATE = "It appears some entities may have still been missed. Answer YES | NO if there are still entities that need to be added."
let DEFAULT_QUERY2KEYWORD_TEMPLATE = """
---Role---

You are a helpful assistant tasked with identifying both answer-type and low-level keywords in the user's query.

---Goal---

Given the query, list both answer-type and low-level keywords.
"answer type keywords" focus on the type of the answer to the certain query, while low-level keywords focus on specific entities, details, or concrete terms.
The "answer type keywords" must be selected from Answer type pool.
This pool is in the form of a dictionary, where the key represents the Type you should choose from and the value represents the example samples.

---Instructions---

- Output the keywords in JSON format.
- The JSON should have three keys:
  - "answer type keywords" for the types of the answer. In this list, the types with the highest likelihood should be placed at the forefront. No more than 3.
  - "entities from query" for specific entities or details. It must be extracted from the query.
######################
-Examples-
######################
Example 1:

Query: "How does international trade influence global economic stability?"
Answer type pool: {
 'PERSONAL LIFE': ['FAMILY TIME', 'HOME MAINTENANCE'],
 'STRATEGY': ['MARKETING PLAN', 'BUSINESS EXPANSION'],
 'SERVICE FACILITATION': ['ONLINE SUPPORT', 'CUSTOMER SERVICE TRAINING'],
 'PERSON': ['JANE DOE', 'JOHN SMITH'],
 'FOOD': ['PASTA', 'SUSHI'],
 'EMOTION': ['HAPPINESS', 'ANGER'],
 'PERSONAL EXPERIENCE': ['TRAVEL ABROAD', 'STUDYING ABROAD'],
 'INTERACTION': ['TEAM MEETING', 'NETWORKING EVENT'],
 'BEVERAGE': ['COFFEE', 'TEA'],
 'PLAN': ['ANNUAL BUDGET', 'PROJECT TIMELINE'],
 'GEO': ['NEW YORK CITY', 'SOUTH AFRICA'],
 'GEAR': ['CAMPING TENT', 'CYCLING HELMET'],
 'EMOJI': ['🎉', '🚀'],
 'BEHAVIOR': ['POSITIVE FEEDBACK', 'NEGATIVE CRITICISM'],
 'TONE': ['FORMAL', 'INFORMAL'],
 'LOCATION': ['DOWNTOWN', 'SUBURBS']
}
################
Output:
{
  "answerTypeKeywords": ["STRATEGY","PERSONAL LIFE"],
  "entitiesFromQuery": ["Trade agreements", "Tariffs", "Currency exchange", "Imports", "Exports"]
}
#############################
Example 2:

Query: "When was SpaceX's first rocket launch?"
Answer type pool: {
 'DATE AND TIME': ['2023-10-10 10:00', 'THIS AFTERNOON'],
 'ORGANIZATION': ['GLOBAL INITIATIVES CORPORATION', 'LOCAL COMMUNITY CENTER'],
 'PERSONAL LIFE': ['DAILY EXERCISE ROUTINE', 'FAMILY VACATION PLANNING'],
 'STRATEGY': ['NEW PRODUCT LAUNCH', 'YEAR-END SALES BOOST'],
 'SERVICE FACILITATION': ['REMOTE IT SUPPORT', 'ON-SITE TRAINING SESSIONS'],
 'PERSON': ['ALEXANDER HAMILTON', 'MARIA CURIE'],
 'FOOD': ['GRILLED SALMON', 'VEGETARIAN BURRITO'],
 'EMOTION': ['EXCITEMENT', 'DISAPPOINTMENT'],
 'PERSONAL EXPERIENCE': ['BIRTHDAY CELEBRATION', 'FIRST MARATHON'],
 'INTERACTION': ['OFFICE WATER COOLER CHAT', 'ONLINE FORUM DEBATE'],
 'BEVERAGE': ['ICED COFFEE', 'GREEN SMOOTHIE'],
 'PLAN': ['WEEKLY MEETING SCHEDULE', 'MONTHLY BUDGET OVERVIEW'],
 'GEO': ['MOUNT EVEREST BASE CAMP', 'THE GREAT BARRIER REEF'],
 'GEAR': ['PROFESSIONAL CAMERA EQUIPMENT', 'OUTDOOR HIKING GEAR'],
 'EMOJI': ['📅', '⏰'],
 'BEHAVIOR': ['PUNCTUALITY', 'HONESTY'],
 'TONE': ['CONFIDENTIAL', 'SATIRICAL'],
 'LOCATION': ['CENTRAL PARK', 'DOWNTOWN LIBRARY']
}

################
Output:
{
  "answerTypeKeywords": ["DATE AND TIME", "ORGANIZATION", "PLAN"],
  "entitiesFromQuery": ["SpaceX", "Rocket launch", "Aerospace", "Power Recovery"]

}
#############################
Example 3:

Query: "What is the role of education in reducing poverty?"
Answer type pool: {
 'PERSONAL LIFE': ['MANAGING WORK-LIFE BALANCE', 'HOME IMPROVEMENT PROJECTS'],
 'STRATEGY': ['MARKETING STRATEGIES FOR Q4', 'EXPANDING INTO NEW MARKETS'],
 'SERVICE FACILITATION': ['CUSTOMER SATISFACTION SURVEYS', 'STAFF RETENTION PROGRAMS'],
 'PERSON': ['ALBERT EINSTEIN', 'MARIA CALLAS'],
 'FOOD': ['PAN-FRIED STEAK', 'POACHED EGGS'],
 'EMOTION': ['OVERWHELM', 'CONTENTMENT'],
 'PERSONAL EXPERIENCE': ['LIVING ABROAD', 'STARTING A NEW JOB'],
 'INTERACTION': ['SOCIAL MEDIA ENGAGEMENT', 'PUBLIC SPEAKING'],
 'BEVERAGE': ['CAPPUCCINO', 'MATCHA LATTE'],
 'PLAN': ['ANNUAL FITNESS GOALS', 'QUARTERLY BUSINESS REVIEW'],
 'GEO': ['THE AMAZON RAINFOREST', 'THE GRAND CANYON'],
 'GEAR': ['SURFING ESSENTIALS', 'CYCLING ACCESSORIES'],
 'EMOJI': ['💻', '📱'],
 'BEHAVIOR': ['TEAMWORK', 'LEADERSHIP'],
 'TONE': ['FORMAL MEETING', 'CASUAL CONVERSATION'],
 'LOCATION': ['URBAN CITY CENTER', 'RURAL COUNTRYSIDE']
}

################
Output:
{
  "answerTypeKeywords": ["STRATEGY", "PERSON"],
  "entitiesFromQuery": ["School access", "Literacy rates", "Job training", "Income inequality"]
}
#############################
Example 4:

Query: "Where is the capital of the United States?"
Answer type pool: {
 'ORGANIZATION': ['GREENPEACE', 'RED CROSS'],
 'PERSONAL LIFE': ['DAILY WORKOUT', 'HOME COOKING'],
 'STRATEGY': ['FINANCIAL INVESTMENT', 'BUSINESS EXPANSION'],
 'SERVICE FACILITATION': ['ONLINE SUPPORT', 'CUSTOMER SERVICE TRAINING'],
 'PERSON': ['ALBERTA SMITH', 'BENJAMIN JONES'],
 'FOOD': ['PASTA CARBONARA', 'SUSHI PLATTER'],
 'EMOTION': ['HAPPINESS', 'SADNESS'],
 'PERSONAL EXPERIENCE': ['TRAVEL ADVENTURE', 'BOOK CLUB'],
 'INTERACTION': ['TEAM BUILDING', 'NETWORKING MEETUP'],
 'BEVERAGE': ['LATTE', 'GREEN TEA'],
 'PLAN': ['WEIGHT LOSS', 'CAREER DEVELOPMENT'],
 'GEO': ['PARIS', 'NEW YORK'],
 'GEAR': ['CAMERA', 'HEADPHONES'],
 'EMOJI': ['🏢', '🌍'],
 'BEHAVIOR': ['POSITIVE THINKING', 'STRESS MANAGEMENT'],
 'TONE': ['FRIENDLY', 'PROFESSIONAL'],
 'LOCATION': ['DOWNTOWN', 'SUBURBS']
}
################
Output:
{
  "answerTypeKeywords": ["LOCATION"],
  "entitiesFromQuery": ["capital of the United States", "Washington", "New York"]
}
#############################

-Real Data-
######################
Query: {query}
Answer type pool:{type_pool}
######################
Output:"""
let DEFAULT_DESCRIPTION_SUMMARIZE_TEMPLATE = """
You are a helpful assistant responsible for generating a comprehensive summary of the data provided below.
Given one or two entities, and a list of descriptions, all related to the same entity or group of entities.
Please concatenate all of these into a single, comprehensive description. Make sure to include information collected from all the descriptions.
If the provided descriptions are contradictory, please resolve the contradictions and provide a single, coherent summary.
Make sure it is written in third person, and include the entity names so we the have full context.
Use English as output language
Ant the make sure the whole output less than {max_tokens} tokens.

#######
---Data---
Entities: {entity_name}
Description List: {description_list}
#######
Output:"""
let DEFAULT_CONTEXT_BUILD_TEMPLATE = """
-----Entities-----
```csv
{entity_context}
```
-----Sources-----
```csv
{chunk_context}
```"""

public class Entity <: Serializable<Entity> & Equatable<Entity> & Hashable {
    private let _name: String
    private var _descs: ArrayList<String>
    private let _sources: ArrayList<String>

    public init(name: String, descs!: ArrayList<String> = ArrayList(), sources!: ArrayList<String> = ArrayList()) {
        this._name = name
        this._descs = descs
        this._sources = sources
    }

    public prop name: String {
        get() {
            this._name
        }
    }

    public prop descs: Array<String> {
        get() {
            this._descs.toArray()
        }
    }

    public prop sources: Array<String> {
        get() {
            this._sources.toArray()
        }
    }

    public func addDesc(desc: String) {
        _descs.add(desc)
    }

    public func addSource(source: String) {
        _sources.add(source)
    }

    public func hashCode(): Int64 {
        var hasher = ObjectHasher()
        hasher.write(_name)
        for (desc in descs) {
            hasher.write(desc)
        }
        for (source in _sources) {
            hasher.write(source)
        }
        return hasher.finish()
    }

    public func serialize(): DataModel {
        let dm = DataModelStruct()
        dm.add(field<String>("_name", _name))
        dm.add(field<Array<String>>("_descs", descs))
        dm.add(field<Array<String>>("_sources", sources))
        dm.add(field<String>("__class__", "Entity"))
        return dm
    }

    public static func deserialize(dm: DataModel): Entity {
        var dms = match (dm) {
            case data: DataModelStruct => data
            case _ => throw Exception("this data is not DataModelStruct")
        }
        let name = String.deserialize(dms.get("_name"))
        let descs = ArrayList(Array<String>.deserialize(dms.get("_descs")))
        var sources = ArrayList(Array<String>.deserialize(dms.get("_sources")))
        return Entity(name, descs: descs, sources: sources)
    }

    public operator func ==(other: Entity): Bool {
        this.name == other.name && this.descs == other.descs && this.sources == other.sources
    }

    @When[cjc_version < "1.0.0"]
    public operator func !=(other: Entity): Bool {
        !(this == other)
    }
}

public class Relationship <: Serializable<Relationship> & Equatable<Relationship> & Hashable {
    private var _descs: ArrayList<String>
    private let _keywords: HashSet<String>
    private let _sources: ArrayList<String>

    public init(descs!: ArrayList<String> = ArrayList(), keywords!: HashSet<String> = HashSet(),
        sources!: ArrayList<String> = ArrayList()) {
        this._descs = descs
        this._keywords = keywords
        this._sources = sources
    }

    public prop descs: Array<String> {
        get() {
            this._descs.toArray()
        }
    }

    public prop keywords: Array<String> {
        get() {
            this._keywords |> collectArray
        }
    }

    public prop sources: Array<String> {
        get() {
            this._sources |> collectArray
        }
    }

    public func addDesc(desc: String) {
        _descs.add(desc)
    }

    public func addSource(source: String) {
        _sources.add(source)
    }

    public func addKeyword(keyword: String) {
        _keywords.add(keyword)
    }

    public func hashCode(): Int64 {
        var hasher = ObjectHasher()
        for (desc in descs) {
            hasher.write(desc)
        }
        for (keyword in keywords) {
            hasher.write(keyword)
        }
        for (source in _sources) {
            hasher.write(source)
        }
        return hasher.finish()
    }

    public func serialize(): DataModel {
        let dm = DataModelStruct()
        dm.add(field<Array<String>>("_descs", descs))
        dm.add(field<Array<String>>("_keywords", keywords))
        dm.add(field<Array<String>>("_sources", sources))
        dm.add(field<String>("__class__", "Relationship"))
        return dm
    }

    public static func deserialize(dm: DataModel): Relationship {
        var dms = match (dm) {
            case data: DataModelStruct => data
            case _ => throw Exception("this data is not DataModelStruct")
        }
        let descs = ArrayList(Array<String>.deserialize(dms.get("_descs")))
        var keywords = HashSet(Array<String>.deserialize(dms.get("_keywords")))
        var sources = ArrayList(Array<String>.deserialize(dms.get("_sources")))
        return Relationship(descs: descs, keywords: keywords, sources: sources)
    }

    public operator func ==(other: Relationship): Bool {
        this.descs == other.descs && this.keywords == other.keywords && this.sources == other.sources
    }

    @When[cjc_version < "1.0.0"]
    public operator func !=(other: Relationship): Bool {
        !(this == other)
    }
}

public class MiniRagConfig {
    public var entityExtractTemplate: String = DEFAULT_ENEITY_EXTRACT_TEMPLATE
    public var entityExtractContinueTemplate: String = DEFAULT_ENEITY_EXTRACT_CONTINUE_TEMPLATE
    public var entityExtractJudgeTemplate: String = DEFAULT_ENTITY_EXTRACT_JUDGE_TEMPLATE
    public var query2KeywordTemplate: String = DEFAULT_QUERY2KEYWORD_TEMPLATE
    public var contextBuildTemplate: String = DEFAULT_CONTEXT_BUILD_TEMPLATE
    public var descSummarizeTemplate: String = DEFAULT_DESCRIPTION_SUMMARIZE_TEMPLATE
    public var splitter: Splitter = RecursiveCharacterTextSplitter(chunkSize: 4096, chunkOverlap: 1024)
    public var entityTypes: Array<String> = ["organization", "person", "geo", "event", "category"]
    public var tupleDelimiter: String = "<|>"
    public var completionDelimiter: String = "<|COMPLETE|>"
    public var recordDelimiter: String = "##"
    public var graphFieldDelimiter: String = "<SEP>"
    public var entityDescMaxTokens: Int64 = 400
    public var chatModel: ChatModel
    public var tokenizer: Tokenizer
    public var embeddingModel: EmbeddingModel
    // Max entityExtractContinue Times
    public var maxContinueTimes = 1

    public init(chatModel: ChatModel, embeddingModel: EmbeddingModel, tokenizer: Tokenizer) {
        this.chatModel = chatModel
        this.embeddingModel = embeddingModel
        this.tokenizer = tokenizer
    }
}

public class MiniRagBuilder {
    var _config: MiniRagConfig
    var _workspace: String = ".storage"
    var _collection: String = "mini"
    var _kvStorageInstance: (workspace: String, collection: String) -> LocalKVStorage<Document> = {
        workspace, collection => JsonKVStorage<Document>(workspace: workspace, collection: collection)
    }
    var _vectorStroageInstance: (workspace: String, collection: String, embeddingModel: EmbeddingModel) -> LocalVectorStorage = {
        workspace, collection, embeddingModel => JsonMemoryVectorStorage(embeddingModel, workspace: workspace,
            collection: collection)
    }
    var _graphStorageInstance: (workspace: String, collection: String) -> LocalGraphStorage<Entity, Relationship> = {
        workspace, collection => BaseLocalGraphStorage<Entity, Relationship>(workspace: workspace,
            collection: collection)
    }

    public init(config: MiniRagConfig) {
        this._config = config
    }

    public func workspace(workspace: String): MiniRagBuilder {
        this._workspace = workspace
        this
    }

    public func collection(collection: String): MiniRagBuilder {
        this._collection = collection
        this
    }

    public func entityTypes(entityTypes: Array<String>) {
        if (entityTypes.isEmpty()) {
            throw IllegalArgumentException("Entity Types Cannot Be Empty!")
        }
        this._config.entityTypes = entityTypes
        this
    }

    public func kvStorageInstance(kvStorageInstance: (workspace: String, collection: String) -> LocalKVStorage<Document>): MiniRagBuilder {
        this._kvStorageInstance = kvStorageInstance
        this
    }

    public func vectorStroageInstance(
        vectorStroageInstance: (workspace: String, collection: String, embeddingModel: EmbeddingModel) -> LocalVectorStorage): MiniRagBuilder {
        this._vectorStroageInstance = vectorStroageInstance
        this
    }

    public func graphStorageInstance(
        graphStorageInstance: (workspace: String, collection: String) -> LocalGraphStorage<Entity, Relationship>): MiniRagBuilder {
        this._graphStorageInstance = graphStorageInstance
        this
    }

    public func entityExtractContinueTemplate(entityExtractContinueTemplate: String): MiniRagBuilder {
        this._config.entityExtractContinueTemplate = entityExtractContinueTemplate
        this
    }

    public func entityExtractJudgeTemplate(entityExtractJudgeTemplate: String): MiniRagBuilder {
        this._config.entityExtractJudgeTemplate = entityExtractJudgeTemplate
        this
    }

    public func entityExtractTemplate(entityExtractTemplate: String): MiniRagBuilder {
        this._config.entityExtractTemplate = entityExtractTemplate
        this
    }

    public func query2KeywordTemplate(query2KeywordTemplate: String): MiniRagBuilder {
        this._config.query2KeywordTemplate = query2KeywordTemplate
        this
    }
    public func contextTemplate(contextTemplate: String): MiniRagBuilder {
        this._config.contextBuildTemplate = contextTemplate
        this
    }

    public func splitter(splitter: Splitter): MiniRagBuilder {
        this._config.splitter = splitter
        this
    }

    public func recordDelimiter(recordDelimiter: String): MiniRagBuilder {
        this._config.recordDelimiter = recordDelimiter
        this
    }

    public func completionDelimiter(completionDelimiter: String): MiniRagBuilder {
        this._config.completionDelimiter = completionDelimiter
        this
    }

    public func tupleDelimiter(tupleDelimiter: String): MiniRagBuilder {
        this._config.tupleDelimiter = tupleDelimiter
        this
    }

    public func entityDescMaxTokens(entityDescMaxTokens: Int64): MiniRagBuilder {
        this._config.entityDescMaxTokens = entityDescMaxTokens
        this
    }

    public func graphFieldDelimiter(graphFieldDelimiter: String): MiniRagBuilder {
        this._config.graphFieldDelimiter = graphFieldDelimiter
        this
    }

    public func tokenizer(tokenizer: Tokenizer): MiniRagBuilder {
        this._config.tokenizer = tokenizer
        this
    }

    public func build(): MiniRag {
        return MiniRag(this)
    }
}

@jsonable
protected class KeyWordsResponse {
    let answerTypeKeywords: Array<String>
    let entitiesFromQuery: Array<String>
}

public class MiniRagRetrival <: Retrieval {
    protected MiniRagRetrival(
        private let docs: Array<Document>,
        private let context: String
    ) {}

    public override prop sources: Array<Document> {
        get() {
            this.docs
        }
    }

    public override func toPrompt(): String {
        return context
    }
}

protected class MiniRagRetriever <: Retriever {
    private var _mode: RetrieverMode
    private let _description: String
    private let _miniRag: MiniRag

    init(mode: RetrieverMode, description: String, miniRag: MiniRag) {
        this._mode = mode
        this._description = description
        this._miniRag = miniRag
    }

    public override prop description: String {
        get() {
            _description
        }
    }

    public mut override prop mode: RetrieverMode {
        get() {
            _mode
        }
        set(m) {
            _mode = m
        }
    }

    public override func search(query: String): Retrieval {
        let (context, sources) = this._miniRag.query(query)
        MiniRagRetrival(sources, context)
    }
}

public class QueryParam {
    public let topK: Int64 = 20
    public let threshold: Float64 = 0.5
    public let maxTokenForEntity: Int64 = 1000
    public let query: String
    public QueryParam(query: String) {
        this.query = query
    }
}

class Route {
    var entityScore: Int64 = 0
    var relationScore: Int64 = 0
    var trace: ArrayList<String> = ArrayList()
    var usedEdges: ArrayList<Edge<Relationship>> = ArrayList()

    public init() {}
    public init(trace: ArrayList<String>) {
        this.trace = trace
    }
}

class CandidateReasoningPath {
    var entity: Vertex<Entity>
    var score: Float64
    var routes: ArrayList<Route> = ArrayList()
    var chunkIds: ArrayList<String> = ArrayList()
    init(entity: Vertex<Entity>, score: Float64) {
        this.entity = entity
        this.score = score
    }
}

public class MiniRag {
    private let _agent: BaseAgent
    private let _embedding_model: EmbeddingModel
    private let _docKv: LocalKVStorage<Document>
    private let _chunkKv: LocalKVStorage<Document>
    private let _graph: LocalGraphStorage<Entity, Relationship>
    private let _entityVdb: LocalVectorStorage
    private let _entityNameVdb: LocalVectorStorage
    private let _relationshipVdb: LocalVectorStorage
    private let _chunkVdb: LocalVectorStorage
    private let _config: MiniRagConfig
    private let _builder: MiniRagBuilder
    private let _splitter: Splitter
    private let _lock: ReentrantReadWriteMutex = ReentrantReadWriteMutex()
    public init(builder: MiniRagBuilder) {
        this._agent = BaseAgent(model: builder._config.chatModel, executor: NaiveExecutor())
        this._embedding_model = builder._config.embeddingModel
        this._docKv = builder._kvStorageInstance(builder._workspace, "${builder._collection}_doc")
        this._chunkKv = builder._kvStorageInstance(builder._workspace, "${builder._collection}_chunk")
        this._graph = builder._graphStorageInstance(builder._workspace, "${builder._collection}_graph")
        this._entityVdb = builder._vectorStroageInstance(builder._workspace, "${builder._collection}_entity",
            this._embedding_model)
        this._entityNameVdb = builder._vectorStroageInstance(builder._workspace, "${builder._collection}_entity_name",
            this._embedding_model)
        this._relationshipVdb = builder._vectorStroageInstance(builder._workspace, "${builder._collection}_relationship",
            this._embedding_model)
        this._chunkVdb = builder._vectorStroageInstance(builder._workspace, "${builder._collection}_chunk",
            this._embedding_model)
        this._splitter = builder._config.splitter
        this._config = builder._config
        this._builder = builder
    }

    public func insert(doc: Document): Unit {
        try {
            this._lock.writeMutex.lock()
            this._insert(doc)
            this.commit()
        } finally {
            this._lock.writeMutex.unlock()
        }
    }

    public func insert(content: String): Unit {
        let doc = Document(content)
        this.insert(doc)
    }

    public func asRetriever(description!: String = "A garph Retriever"): Retriever {
        MiniRagRetriever(RetrieverMode.Static, description, this)
    }

    protected func query(query: String): (String, Array<Document>) {
        this.query(QueryParam(query))
    }

    protected func query(queryParam: QueryParam): (String, Array<Document>) {
        try {
            this._lock.readMutex.lock()
            this._query(queryParam)
        } finally {
            this._lock.readMutex.unlock()
        }
    }

    private func _query(queryParam: QueryParam): (String, Array<Document>) {
        let (keywords, entities) = getMiniKeywords(queryParam.query)
        buildMiniQueryContext(queryParam, keywords, entities)
    }

    private func getMiniKeywords(query: String): (Array<String>, Array<String>) {
        let eTypes = this._graph.getVertexTypes()
        let query2keywordPrompt = this
            ._config
            .query2KeywordTemplate
            .format(("query", query), ("type_pool", eTypes.toArray()))
        let kwResponse = this
            ._agent
            .chatGet<KeyWordsResponse>(query2keywordPrompt)
            .getOrThrow({=> AgentExecutionException("Get Keywords Failed!")})
        let answerTypes = kwResponse.answerTypeKeywords |> inspect({keyword => keyword.toAsciiLower()}) |> collectArray
        let entitiesFromQuery = kwResponse.entitiesFromQuery
        return (answerTypes, entitiesFromQuery)
    }

    private func buildMiniQueryContext(queryParam: QueryParam, answerTypes: Array<String>,
        entitiesFromQuery: Array<String>): (String, Array<Document>) {

        // used to record entity ids ever appeared, enbales duplicate
        let appeardEntityIds = ArrayList<String>()
        let entitiesFromQueryMap = HashMap<String, ArrayList<String>>()
        let docsWithScoreFromQuery = ArrayList<(Document, Float64)>()
        for (entityName in entitiesFromQuery) {
            let docsWithScore = this
                ._entityNameVdb
                .queryWithScore(entityName, queryParam.topK, threshold: queryParam.threshold)
            docsWithScoreFromQuery.add(all: docsWithScore)
            entitiesFromQueryMap.addIfAbsent(entityName, docsWithScore |> map {ds => ds[0].content} |> collectArrayList)
        }
        // structure:{entityName: {score:0.0, routes:[]}}
        let crpMap = HashMap<String, CandidateReasoningPath>()
        // (EntityNameDoc,Score) => (entityName,CandidateReasoningPath)
        docsWithScoreFromQuery |> filter({ds => this._graph.hasVertex(ds[0].content)}) |>
            forEach {ds => fillCandidateRouteMap(ds, crpMap)}
        // fill 2hops of entity
        for ((entityName, crp) in crpMap) {
            crp.routes.add(all: this.queryNeighborsWithinKHops(entityName, 2))
            appeardEntityIds.add(entityName)
        }

        let answerVertexCandidates = this.getVerticesFromTypes(answerTypes)
        let entityIdsFromAnswer = answerVertexCandidates |> map({vertex => vertex.id}) |> collectArray
        appeardEntityIds.add(all: entityIdsFromAnswer)
        calEntityScore(crpMap, entityIdsFromAnswer)

        let edgeDocs = searchEdgeDocs(queryParam, entitiesFromQuery, appeardEntityIds)
        edgeVoteCandidate(crpMap, edgeDocs)
        populateCandidateChunkIds(crpMap, queryParam, maxChunks: 3)
        let entityContext = assembleEntityContext(crpMap, queryParam)
        let finalChunkDocs = kwdToChunk(crpMap, queryParam, entitiesFromQueryMap)
        let chunkContext = toCSVString<Document>(["id", "content"], finalChunkDocs,
            {index: Int64, doc: Document => [index.toString(), "\"${doc.content.replace("\"","\\\"")}\""]})
        return (this
                ._config
                .contextBuildTemplate
                .format(("entity_context", entityContext), ("chunk_context", chunkContext)), finalChunkDocs)
    }

    private func fillCandidateRouteMap(docWithScore: (Document, Float64), crpMap: Map<String, CandidateReasoningPath>) {
        let content = docWithScore[0].content
        let route = CandidateReasoningPath(this._graph.getVertex(content).getOrThrow(), docWithScore[1])
        if (!crpMap.contains(content)) {
            crpMap.add(content, route)
        } else {
            var curCrp = crpMap.get(content).getOrThrow()
            if (curCrp.score < route.score) {
                crpMap.add(content, route)
            }
        }
    }

    private func kwdToChunk(crpMap: Map<String, CandidateReasoningPath>, queryParam: QueryParam,
        keywordsMap: Map<String, ArrayList<String>>): Array<Document> {
        let chunkDocs = this
            ._chunkVdb
            .query(queryParam.query, Int64(queryParam.topK / 2), threshold: queryParam.threshold / 2.0)
        let chunkMap = chunkDocs |> map({chunkDoc => (chunkDoc.id, chunkDoc)}) |> collectHashMap
        let finalChunkIds = Counter<String>()
        for ((keyword, entityNames) in keywordsMap) {
            let curChunkIds = Counter<String>()
            for ((i, entityName) in enumerate(entityNames)) {
                if (let Some(reasoningPath) <- crpMap.get(entityName)) {
                    var score = if (i == 0) {
                        2.0 * reasoningPath.score
                    } else {
                        reasoningPath.score
                    }
                    for ((j, chunkId) in enumerate(reasoningPath.chunkIds)) {
                        if (j == 0 && chunkMap.contains(chunkId)) {
                            score = 10.0 * score
                        }
                        curChunkIds.add(chunkId, score)
                    }
                }
            }
            finalChunkIds.merge(curChunkIds)
        }
        let topChunks = finalChunkIds.getMostCommon(queryParam.topK / 2)
        return topChunks |> map({cid => this._chunkKv.get(cid).getOrThrow()}) |> collectArray
    }

    private func assembleEntityContext(crpMap: Map<String, CandidateReasoningPath>, queryParam: QueryParam): String {
        var entitySectionList: ArrayList<(String, Float64, String)> = crpMap |> map(
            {
            entry => (entry[0], entry[1].score, String.join(entry[1].entity.data.getOrThrow().descs,
                    delimiter: this._config.graphFieldDelimiter))
        }) |> collectArrayList
        entitySectionList.sortBy(stable: true) {
            lht: (String, Float64, String), rht: (String, Float64, String) =>
            if (lht[1] < rht[1]) {
                return Ordering.GT
            }
            if (lht[1] > rht[1]) {
                return Ordering.LT
            }
            return Ordering.EQ
        }
        entitySectionList = truncateListByTokenSize<(String, Float64, String)>(entitySectionList,
            {key: (String, Float64, String) => key[2]}, queryParam.maxTokenForEntity)
        toCSVString<(String, Float64, String)>(["entity", "score", "description"], entitySectionList.toArray(),
            {
            index: Int64, tuple: (String, Float64, String) => [tuple[0], tuple[1].toString(),
                "\"${tuple[2].replace("\"","\\\"")}\""]
        })
    }

    private func toCSVString<T>(title: Array<String>, data: Array<T>, dataToStringFunc: (Int64, T) -> Array<String>): String {
        var sb = StringBuilder()
        sb.append(String.join(title, delimiter: ","))
        sb.append("\n")
        for ((index, item) in enumerate(data)) {
            sb.append(String.join(dataToStringFunc(index, item), delimiter: ","))
            sb.append("\n")
        }
        return sb.toString().trimAscii()
    }

    private func truncateListByTokenSize<T>(lst: ArrayList<T>, keyFunc: (T) -> String, maxTokens: Int64): ArrayList<T> {
        if (maxTokens <= 0) {
            return ArrayList()
        }
        var tokens = 0
        for ((i, data) in enumerate(lst)) {
            tokens += this._config.tokenizer.encode(keyFunc(data)).size
            if (tokens > maxTokens) {
                return lst[0..i]
            }
        }
        return lst
    }

    /**
     * get most common chunkids from edges and vertex
     */
    private func populateCandidateChunkIds(crpMap: Map<String, CandidateReasoningPath>, queryParam: QueryParam,
        maxChunks!: Int64 = 5) {
        let visitedSources = HashMap<String, Array<String>>()
        for (resoningPath in crpMap.values()) {
            let immediateEntity = resoningPath.entity.data.getOrThrow()
            let chunkIds = Counter<String>()
            for (route in resoningPath.routes) {
                let sources = ArrayList<String>()
                let usedEdges = route.usedEdges
                if (route.usedEdges.size > 0) {
                    sources.add(all: route.usedEdges.get(0).getOrThrow().data.getOrThrow().sources)
                }
                sources.add(all: immediateEntity.sources)
                for (i in 1..route.trace.size) {
                    let entityName = route.trace.get(i).getOrThrow()
                    let immediateSources: Array<String>
                    if (let Some(immediateSources) <- visitedSources.get(entityName)) {
                        sources.add(all: immediateSources)
                        continue
                    }
                    if (let Some(entity) <- this._graph.getVertex(entityName)) {
                        immediateSources = getIntermediateSources(entity.data.getOrThrow(), queryParam.query)
                    } else {
                        immediateSources = []
                    }
                    sources.add(all: immediateSources)
                    visitedSources.add(entityName, immediateSources)
                }
                let totalScore = route.entityScore + route.relationScore + 1
                let counter = Counter<String>(sources, Float64(totalScore))
                chunkIds.merge(counter)
            }
            if (!chunkIds.isEmpty()) {
                let topChunks = chunkIds.getMostCommon(maxChunks)
                resoningPath.chunkIds.add(all: topChunks)
            }
        }
    }

    /**
     * get sources for intermediate entities in the route
     * if desc is not summarized. choose top 5 chunks
     * if desc is summarized. just return the org sources
     */
    private func getIntermediateSources(entity: Entity, query: String): Array<String> {
        let descs = entity.descs
        let sources = entity.sources
        if (descs.size != sources.size) {
            return sources
        }
        if (sources.size > 5) {
            let consideredIds = calculateSimilarity(query, descs, 5)
            return consideredIds |> map({id => sources.get(id).getOrThrow()}) |> collectArray
        }
        return sources
    }

    private func calculateSimilarity(query: String, descs: Array<String>, max: Int64): Array<Int64> {
        let queryTokens = HashSet(query.toAsciiLower().toRuneArray())
        let scores = ArrayList<(Int64, Float64)>()
        for ((i, desc) in enumerate(descs)) {
            let descTokens = desc.toAsciiLower().toRuneArray()
            let intersection = HashSet(descTokens)
            intersection.retain(all: queryTokens)
            let union = HashSet(descTokens)
            union.add(all: queryTokens)
            scores.add((i, Float64(intersection.size) / Float64(union.size)))
        }
        // reverse sorted by similarity
        scores.sortBy(stable: true) {
            rht: (Int64, Float64), lht: (Int64, Float64) =>
            if (lht[1] < rht[1]) {
                return Ordering.GT
            }
            if (lht[1] > rht[1]) {
                return Ordering.LT
            }
            return Ordering.EQ
        }
        return scores[0..max] |> map({item => item[0]}) |> collectArray
    }

    /**
     * Vote Candidate Using Edges searched by orgQuery.
     * When the CandidateReasoningPath contains one edge, edge score + 1
     */
    private func edgeVoteCandidate(crpMap: Map<String, CandidateReasoningPath>, edgeDocs: Array<Document>): Unit {
        let edges = edgeDocs |> map(
            {doc => (doc.metadata.get("srcId").getOrThrow(), doc.metadata.get("tgtId").getOrThrow())}) |> collectArray
        for (reasoingPath in crpMap.values()) {
            for (route in reasoingPath.routes) {
                calRelationScore(route, edges)
            }
        }
    }

    private func calRelationScore(route: Route, edges: Array<(String, String)>): Unit {
        let trace = route.trace.toArray()
        for (edge in edges) {
            if (!trace.contains(edge[0]) || !trace.contains(edge[1])) {
                continue
            }
            if (trace.indexOf(edge[1]).getOrThrow() - trace.indexOf(edge[0]).getOrThrow() != 1) {
                continue
            }
            if (let Some(relation) <- this._graph.getEdge(edge[0], edge[1], "DEFAULT")) {
                route.relationScore += 1
                route.usedEdges.add(relation)
            }
        }
    }

    /**
     * search Edges that srcId or tgtId every appeared
     */
    private func searchEdgeDocs(queryParam: QueryParam, entitiesFromQuery: Array<String>,
        appeardEntityIds: ArrayList<String>): Array<Document> {
        let edgeDocs = this
            ._relationshipVdb
            .query(queryParam.query, Int64(entitiesFromQuery.size * queryParam.topK),
                threshold: queryParam.threshold / 2.0)
        let apeSet = HashSet<String>(appeardEntityIds)
        edgeDocs |> filter(
            {
                doc =>
                let srcId = doc.metadata.get("srcId").getOrThrow()
                let tgtId = doc.metadata.get("tgtId").getOrThrow()
                apeSet.contains(srcId) || apeSet.contains(tgtId)
            }
        ) |> collectArray
    }

    /**
     * Set intersection size between "All Appeared entities" and "2hop routes" as Entity Score of the route.
     */
    private func calEntityScore(crpMap: HashMap<String, CandidateReasoningPath>, candidates: Array<String>) {
        let cSet = HashSet<String>(candidates)
        for (candidateReasoningPath in crpMap.values()) {
            let routes = candidateReasoningPath.routes
            for (route in routes) {
                let trace = route.trace
                let rSet = HashSet(trace)
                rSet.retain(all: cSet)
                route.entityScore = rSet.size
            }
        }
    }

    private func getVerticesFromTypes(answerTypes: Array<String>): ArrayList<Vertex<Entity>> {
        let vertices = this._graph.getAllVertices()
        let typeSet = HashSet(answerTypes)
        let vertexList = ArrayList<Vertex<Entity>>()
        for (vertex in vertices) {
            if (typeSet.contains(vertex.vType)) {
                vertexList.add(vertex)
            }
        }
        vertexList
    }

    private func queryNeighborsWithinKHops(vertexId: String, kHops: Int64): Array<Route> {
        if (!this._graph.hasVertex(vertexId)) {
            return []
        }

        var traces: ArrayList<ArrayList<String>> = getRoutes(vertexId)
        var count = 1
        while (count < kHops) {
            count += 1
            var tracesClone = traces.clone()
            traces.clear()
            for (trace in tracesClone) {
                var extendRoutes = getRoutes(trace[trace.size - 1])
                let mergedTraces = mergeTrace(trace, extendRoutes)
                traces.add(all: mergedTraces)
            }
        }
        return traces |> map({trace => Route(trace)}) |> collectArray
    }

    /**
     * Remove Edges With Same [SRC,TGT] tuples
     * [a,b] and [b,a] are seemed as duplicated edges
     * combine [a,b] and [b,c] into a longer route [a,b,c]
     */
    private func mergeTrace(trace: ArrayList<String>, extendTraces: ArrayList<ArrayList<String>>): ArrayList<ArrayList<String>> {
        if (extendTraces.size == 0) {
            return ArrayList([trace])
        }
        let mergedTraces = ArrayList<ArrayList<String>>()
        let sourceSet = HashSet<String>(trace)
        for (exTrace in extendTraces) {
            // remove duplicate
            if (sourceSet.contains(all: exTrace)) {
                continue
            }
            var newTrace = trace.clone()
            newTrace.add(exTrace[exTrace.size - 1])
            mergedTraces.add(newTrace)
        }
        mergedTraces
    }

    private func getRoutes(vertexId: String): ArrayList<ArrayList<String>> {
        this._graph.getOutgoingEdgesOf(vertexId) |> map({edge => ArrayList([edge.srcId, edge.tgtId])}) |>
            collectArrayList
    }

    private func _insert(doc: Document): Unit {
        if (let Some(curDoc) <- this._docKv.get(doc.id)) {
            if (curDoc == doc) {
                LogUtils.info("[Doc] Duplicated Doc:${doc.id}.")
                return
            }
            if (curDoc.content == doc.content) {
                this._docKv.upsert(doc.id, doc)
                LogUtils.info("[Doc] Duplicated Doc:${doc.id}.")
                return
            }
        }
        this._docKv.upsert(doc.id, doc)
        LogUtils.info("[Doc] New Doc:${doc.id} Build Graph Start.")

        let chunks = split(doc)
        if (chunks.size == 0) {
            return
        }
        LogUtils.info("[Chunk] ${chunks.size} New Chunks Found.")
        chunks |> forEach {
            chunk =>
            this._chunkKv.upsert(chunk.id, chunk)
            this._chunkVdb.add(chunk)
            LogUtils.info("[Chunk] New Chunk ${chunk.id} Inserted.")
        }

        this._insertGraph(chunks)
        LogUtils.info("[Doc] New Doc:${doc.id} Build Graph End.")
    }

    private func _insertGraph(chunks: Array<Document>): Unit {
        let entityMap = HashMap<String, ArrayList<Vertex<Entity>>>()
        let relationMap = HashMap<String, ArrayList<Edge<Relationship>>>()
        for (chunk in chunks) {
            let (vertices, edges) = this.extractEntities(chunk)
            for (vertex in vertices) {
                if (!entityMap.contains(vertex.id)) {
                    entityMap.add(vertex.id, ArrayList())
                }
                let entities = entityMap.get(vertex.id).getOrThrow()
                entities.add(vertex)
            }
            for (edge in edges) {
                if (!relationMap.contains(edge.uniqueId)) {
                    relationMap.add(edge.uniqueId, ArrayList())
                }
                let relations = relationMap.get(edge.uniqueId).getOrThrow()
                relations.add(edge)
            }
        }

        for ((id, entities) in entityMap) {
            mergeEntityAndUpsert(entities)
        }

        for ((id, relations) in relationMap) {
            mergeRelationShipAndUpsert(relations)
        }
    }

    private func mergeEntityAndUpsert(vertexes: ArrayList<Vertex<Entity>>): Unit {
        if (vertexes.isEmpty()) {
            return
        }
        let vId = vertexes.get(0).getOrThrow().id
        let allEntityTypes = ArrayList<String>()
        let allSources = HashSet<String>()
        let allDescriptions = HashSet<String>()

        if (let Some(v) <- this._graph.getVertex(vId)) {
            allEntityTypes.add(v.vType)
            allDescriptions.add(all: v.data.getOrThrow().descs)
            allSources.add(all: v.data.getOrThrow().sources)
        }

        for (v in vertexes) {
            allEntityTypes.add(v.vType)
            allDescriptions.add(all: v.data.getOrThrow().descs)
            allSources.add(all: v.data.getOrThrow().sources)
        }
        let vType = bestType(allEntityTypes).getOrThrow()
        let allDescs = allDescriptions.toArray()
        allDescs.sort()
        let realDescs = summarizeDescription(vId, allDescs)
        let vertex = Vertex<Entity>(vId, vType: vType, data: Entity(vId))
        let entity = vertex.data.getOrThrow()
        allSources |> forEach {source => entity.addSource(source)}
        realDescs |> forEach {desc => entity.addDesc(desc)}
        this._graph.upsertVertex(vertex)
        this._entityNameVdb.add(Document(entity.name))
        this
            ._entityVdb
            .add(Document("${entity.name}\n${String.join(entity.descs, delimiter: this._config.graphFieldDelimiter)}"))
    }

    private func mergeRelationShipAndUpsert(relations: ArrayList<Edge<Relationship>>): Unit {
        if (relations.isEmpty()) {
            return
        }
        let srcId = relations.get(0).getOrThrow().srcId
        let tgtId = relations.get(0).getOrThrow().tgtId
        let eType = relations.get(0).getOrThrow().eType
        let allSources = ArrayList<String>()
        let allDescriptions = ArrayList<String>()
        let allKeywords = HashSet<String>()
        let allWeights = ArrayList<Float64>()
        if (let Some(e) <- this._graph.getEdge(srcId, tgtId, eType)) {
            allWeights.add(e.weight)
            allDescriptions.add(all: e.data.getOrThrow().descs)
            allSources.add(all: e.data.getOrThrow().sources)
            allKeywords.add(all: e.data.getOrThrow().keywords)
        }
        for (e in relations) {
            allWeights.add(e.weight)
            allDescriptions.add(all: e.data.getOrThrow().descs)
            allSources.add(all: e.data.getOrThrow().sources)
            allKeywords.add(all: e.data.getOrThrow().keywords)
        }
        let allDescs = allDescriptions.toArray()
        allDescs.sort()
        let realDescs = summarizeDescription("(${srcId},${tgtId})", allDescs)
        let edge = Edge<Relationship>(srcId, tgtId, eType: eType, weight: sumWeights(allWeights), data: Relationship())
        let relationShip = edge.data.getOrThrow()
        allSources |> forEach {source => relationShip.addSource(source)}
        realDescs |> forEach {desc => relationShip.addDesc(desc)}
        allKeywords |> forEach {keyword => relationShip.addKeyword(keyword)}
        try {
            this._graph.upsertEdge(edge)
            let edgeDoc = Document(
                "${String.join(relationShip.keywords,delimiter:" ")}\n${edge.srcId}\n${edge.tgtId}\n${String.join(relationShip.descs, delimiter: this._config.graphFieldDelimiter)}"
            )
            edgeDoc.metadata.add("srcId", edge.srcId)
            edgeDoc.metadata.add("tgtId", edge.tgtId)
            edgeDoc.metadata.add("eType", edge.eType)
            this._relationshipVdb.add(edgeDoc)
        } catch (e: Exception) {
            LogUtils.error("Upsert Edge ${edge.srcId}-${edge.tgtId} Failed.\n ${e}")
        }
    }

    private func sumWeights(weights: ArrayList<Float64>) {
        var total = 0.0
        for (weight in weights) {
            total += weight
        }
        return total
    }

    private func summarizeDescription(entityOrRelationName: String, descs: Array<String>): Array<String> {
        let description = String.join(descs)
        let tokenSize = this._config.tokenizer.encode(description).size
        if (tokenSize < this._config.entityDescMaxTokens) {
            return descs
        }
        let summarizePrompt = this
            ._config
            .descSummarizeTemplate
            .format(("entity_name", entityOrRelationName), ("description_list", descs),
                ("max_tokens", Int64(Float64(this._config.entityDescMaxTokens) * 0.5)))
        let res = this._agent.chat(summarizePrompt)
        return Array(1, {i => res})
    }

    private func bestType(types: ArrayList<String>) {
        let counter = Counter<String>()
        let preferType = types.get(0).getOrThrow()
        for (vType in types) {
            counter.add(vType)
        }
        return counter.getBest(preferType)
    }

    private func extractEntities(chunk: Document): (Array<Vertex<Entity>>, Array<Edge<Relationship>>) {
        let extractTemplate = this._config.entityExtractTemplate
        let continuePrompt = this._config.entityExtractContinueTemplate
        let judgePrompt = this._config.entityExtractJudgeTemplate
        let extractPrompt = extractTemplate.format(
            ("tuple_delimiter", this._config.tupleDelimiter),
            ("record_delimiter", this._config.recordDelimiter),
            ("completion_delimiter", this._config.completionDelimiter),
            ("entity_types", this._config.entityTypes),
            ("input_text", chunk.content)
        )
        var response = this._agent.chat(AgentRequest(extractPrompt))
        var finalResult = response.content
        var chatRound = response.execution.chatRound
        for (i in (0..this._config.maxContinueTimes)) {
            let continueResult = this._agent.chat(AgentRequest(continuePrompt, conversation: Conversation(chatRound)))
            finalResult += continueResult.content
            chatRound = response.execution.chatRound
            if (i >= this._config.maxContinueTimes - 1) {
                break
            }
            let judgeResult = this._agent.chat(AgentRequest(judgePrompt, conversation: Conversation(chatRound)))
            if (!judgeResult.content.toAsciiLower().contains("yes")) {
                break
            }
        }
        return parseResult(chunk.id, finalResult)
    }

    private func parseResult(source: String, result: String): (Array<Vertex<Entity>>, Array<Edge<Relationship>>) {
        let records = splitByMarkers(result, [this._config.recordDelimiter, this._config.completionDelimiter])
        let entityVertexs = ArrayList<Vertex<Entity>>()
        let relationEdges = ArrayList<Edge<Relationship>>()
        for (record in records) {
            let roption = regSearch(record.trimAscii(), "\\((.*)\\)", group: 1)
            if (roption.isNone()) {
                continue
            }
            let _record = roption.getOrThrow()
            let recordAttis = splitByMarkers(_record, [this._config.tupleDelimiter])
            if (let Some(entity) <- instanceEntity(source, recordAttis)) {
                entityVertexs.add(entity)
            }
            if (let Some(relationShip) <- instanceRelationShip(source, recordAttis)) {
                relationEdges.add(relationShip)
            }
        }
        LogUtils.info("===${entityVertexs.size} entities and ${relationEdges.size} relationships extracted.")
        return (entityVertexs.toArray(), relationEdges.toArray())
    }

    private func instanceEntity(source: String, recordAttis: Array<String>): Option<Vertex<Entity>> {
        if (recordAttis.size < 4 || recordAttis.get(0).getOrThrow().toAsciiLower() != '"entity"') {
            return None
        }
        let name = recordAttis.get(1).getOrThrow().trimAscii().replace('"', "")
        if (name.isEmpty()) {
            return None
        }
        let vType = recordAttis.get(2).getOrThrow().trimAscii().replace('"', "").toAsciiLower()
        let description = recordAttis.get(3).getOrThrow().trimAscii().replace('"', "")
        let entity = Entity(name)
        entity.addDesc(description)
        entity.addSource(source)
        let vertex = Vertex<Entity>(name, vType: vType, data: entity)
        vertex
    }

    private func instanceRelationShip(source: String, recordAttis: Array<String>): Option<Edge<Relationship>> {
        if (recordAttis.size < 5 || recordAttis.get(0).getOrThrow().toAsciiLower() != '"relationship"') {
            return None
        }
        let src = recordAttis.get(1).getOrThrow().trimAscii().replace('"', "")
        let tgt = recordAttis.get(2).getOrThrow().trimAscii().replace('"', "")
        let description = recordAttis.get(3).getOrThrow().trimAscii().replace('"', "")
        let keywords = recordAttis.get(4).getOrThrow().trimAscii().replace('"', "")
        let relationship = Relationship()
        relationship.addDesc(description)
        for (keyword in keywords.split(",")) {
            relationship.addKeyword(keyword.trimAscii())
        }
        relationship.addSource(source)
        let edge = Edge<Relationship>(src, tgt, data: relationship)
        edge
    }

    private func split(doc: Document): Array<Document> {
        this._splitter.split(doc.content) |> inspect(
            {
                chunk =>
                for ((k, v) in doc.metadata) {
                    chunk.metadata.addIfAbsent(k, v)
                }
                chunk.metadata.add("doc_id", doc.id)
            }
        ) |> filter({chunk => this._chunkKv.get(chunk.id).isNone()}) |> collectArray
    }

    public func commit(): Unit {
        try {
            this._lock.writeMutex.lock()
            _docKv.commit()
            _chunkKv.commit()
            _graph.commit()
            _entityVdb.commit()
            _entityNameVdb.commit()
            _relationshipVdb.commit()
            _chunkVdb.commit()
        } finally {
            this._lock.writeMutex.unlock()
        }
    }

    public func close(): Unit {
        try {
            this._lock.writeMutex.lock()
            this.commit()
            _docKv.close()
            _chunkKv.close()
            _graph.close()
            _entityVdb.close()
            _entityNameVdb.close()
            _relationshipVdb.close()
            _chunkVdb.close()
        } finally {
            this._lock.writeMutex.unlock()
        }
    }

    public func reset(): Unit {
        try {
            this._lock.writeMutex.lock()
            _docKv.reset()
            _chunkKv.reset()
            _graph.reset()
            _entityVdb.reset()
            _entityNameVdb.reset()
            _relationshipVdb.reset()
            _chunkVdb.reset()
        } finally {
            this._lock.writeMutex.unlock()
        }
    }
}
