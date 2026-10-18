/*
========================================================================================
IoT PULSE — Power BI Power Query M Integration Templates
Connecting Power BI Desktop to FastAPI Analytics Backend (http://127.0.0.1:8000)
with Dual-Mode Support: Live API Refresh + Local CSV Fallback
========================================================================================
*/

// =====================================================================================
// SECTION 1: GLOBAL PARAMETERS
// =====================================================================================
// Create a Power BI Parameter named "ApiBaseUrl" with type Text and current value:
// "http://127.0.0.1:8000/api"
// Create a Power BI Parameter named "ExportsFolderPath" with type Text and current value:
// "C:\Users\<user>\Desktop\fods\exports" (or macOS / Unix path)

// =====================================================================================
// QUERY 1: AttackDistribution (Live API)
// =====================================================================================
let
    BaseUrl = "http://127.0.0.1:8000/api",
    Source = Json.Document(Web.Contents(BaseUrl & "/attacks/distribution")),
    distribution = Source[distribution],
    #"Converted to Table" = Table.FromList(distribution, Splitter.SplitByNothing(), null, null, ExtraValues.Error),
    #"Expanded Column1" = Table.ExpandRecordColumn(#"Converted to Table", "Column1", {"attack_type", "record_count", "percentage", "is_normal"}, {"Attack_Type", "Record_Count", "Percentage", "Is_Normal"}),
    #"Changed Type" = Table.TransformColumnTypes(#"Expanded Column1", {{"Attack_Type", type text}, {"Record_Count", Int64.Type}, {"Percentage", type number}, {"Is_Normal", type logical}})
in
    #"Changed Type"

// =====================================================================================
// QUERY 2: ProtocolDistribution (Live API)
// =====================================================================================
let
    BaseUrl = "http://127.0.0.1:8000/api",
    Source = Json.Document(Web.Contents(BaseUrl & "/protocols")),
    distribution = Source[distribution],
    #"Converted to Table" = Table.FromList(distribution, Splitter.SplitByNothing(), null, null, ExtraValues.Error),
    #"Expanded Column1" = Table.ExpandRecordColumn(#"Converted to Table", "Column1", {"proto", "record_count", "percentage"}, {"Protocol", "Record_Count", "Percentage"}),
    #"Changed Type" = Table.TransformColumnTypes(#"Expanded Column1", {{"Protocol", type text}, {"Record_Count", Int64.Type}, {"Percentage", type number}})
in
    #"Changed Type"

// =====================================================================================
// QUERY 3: ServiceDistribution (Live API)
// =====================================================================================
let
    BaseUrl = "http://127.0.0.1:8000/api",
    Source = Json.Document(Web.Contents(BaseUrl & "/services?top_n=30")),
    distribution = Source[distribution],
    #"Converted to Table" = Table.FromList(distribution, Splitter.SplitByNothing(), null, null, ExtraValues.Error),
    #"Expanded Column1" = Table.ExpandRecordColumn(#"Converted to Table", "Column1", {"service", "record_count", "percentage"}, {"Service", "Record_Count", "Percentage"}),
    #"Changed Type" = Table.TransformColumnTypes(#"Expanded Column1", {{"Service", type text}, {"Record_Count", Int64.Type}, {"Percentage", type number}})
in
    #"Changed Type"

// =====================================================================================
// QUERY 4: FeatureSummary (Live API)
// =====================================================================================
let
    BaseUrl = "http://127.0.0.1:8000/api",
    Source = Json.Document(Web.Contents(BaseUrl & "/features/summary")),
    features = Source[features],
    #"Converted to Table" = Table.FromList(features, Splitter.SplitByNothing(), null, null, ExtraValues.Error),
    #"Expanded Column1" = Table.ExpandRecordColumn(#"Converted to Table", "Column1", 
        {"feature", "dtype", "count", "mean", "std", "min", "q25", "median", "q75", "max", "iqr", "outlier_count", "outlier_percentage"}, 
        {"Feature", "Data_Type", "Count", "Mean", "Std_Dev", "Min", "Q25", "Median", "Q75", "Max", "IQR", "Outlier_Count", "Outlier_Percentage"}),
    #"Changed Type" = Table.TransformColumnTypes(#"Expanded Column1", {
        {"Feature", type text}, {"Data_Type", type text}, {"Count", Int64.Type}, 
        {"Mean", type number}, {"Std_Dev", type number}, {"Min", type number}, 
        {"Q25", type number}, {"Median", type number}, {"Q75", type number}, 
        {"Max", type number}, {"IQR", type number}, {"Outlier_Count", Int64.Type}, 
        {"Outlier_Percentage", type number}
    })
in
    #"Changed Type"

// =====================================================================================
// QUERY 5: HypothesisTestResults (Live API)
// =====================================================================================
let
    BaseUrl = "http://127.0.0.1:8000/api",
    Source = Json.Document(Web.Contents(BaseUrl & "/hypotheses")),
    tests = Source[tests],
    #"Converted to Table" = Table.FromList(tests, Splitter.SplitByNothing(), null, null, ExtraValues.Error),
    #"Expanded Column1" = Table.ExpandRecordColumn(#"Converted to Table", "Column1", 
        {"question", "test", "statistic_name", "statistic", "p_value", "p_value_adjusted_BH", "n", "effect_name", "effect_value", "significant_raw_005", "significant_BH_005", "notes"}, 
        {"Question", "Test_Method", "Statistic_Name", "Statistic_Value", "P_Value_Raw", "P_Value_Adjusted_BH", "Sample_Size", "Effect_Size_Name", "Effect_Size_Value", "Significant_Raw", "Significant_BH", "Notes"}),
    #"Changed Type" = Table.TransformColumnTypes(#"Expanded Column1", {
        {"Question", type text}, {"Test_Method", type text}, {"Statistic_Name", type text}, 
        {"Statistic_Value", type number}, {"P_Value_Raw", type number}, {"P_Value_Adjusted_BH", type number}, 
        {"Sample_Size", Int64.Type}, {"Effect_Size_Name", type text}, {"Effect_Size_Value", type number}, 
        {"Significant_Raw", type logical}, {"Significant_BH", type logical}, {"Notes", type text}
    })
in
    #"Changed Type"

// =====================================================================================
// QUERY 6: ModelMetrics (Live API)
// =====================================================================================
let
    BaseUrl = "http://127.0.0.1:8000/api",
    Source = Json.Document(Web.Contents(BaseUrl & "/model/metrics")),
    model_metrics = Source[model_metrics],
    #"Converted to Table" = Table.FromList(model_metrics, Splitter.SplitByNothing(), null, null, ExtraValues.Error),
    #"Expanded Column1" = Table.ExpandRecordColumn(#"Converted to Table", "Column1", 
        {"model", "accuracy", "balanced_accuracy", "macro_F1", "weighted_F1"}, 
        {"Model_Name", "Accuracy", "Balanced_Accuracy", "Macro_F1", "Weighted_F1"}),
    #"Changed Type" = Table.TransformColumnTypes(#"Expanded Column1", {
        {"Model_Name", type text}, {"Accuracy", type number}, {"Balanced_Accuracy", type number}, 
        {"Macro_F1", type number}, {"Weighted_F1", type number}
    })
in
    #"Changed Type"

// =====================================================================================
// QUERY 7: FeatureImportance (Live API)
// =====================================================================================
let
    BaseUrl = "http://127.0.0.1:8000/api",
    Source = Json.Document(Web.Contents(BaseUrl & "/model/feature-importance")),
    #"Converted to Table" = Table.FromList(Source, Splitter.SplitByNothing(), null, null, ExtraValues.Error),
    #"Expanded Column1" = Table.ExpandRecordColumn(#"Converted to Table", "Column1", {"feature", "importance"}, {"Feature", "Importance"}),
    #"Changed Type" = Table.TransformColumnTypes(#"Expanded Column1", {{"Feature", type text}, {"Importance", type number}})
in
    #"Changed Type"

// =====================================================================================
// QUERY 8: StatisticalQuestions (Live API)
// =====================================================================================
let
    BaseUrl = "http://127.0.0.1:8000/api",
    Source = Json.Document(Web.Contents(BaseUrl & "/statistics/questions")),
    questions = Source[questions],
    #"Converted to Table" = Table.FromList(questions, Splitter.SplitByNothing(), null, null, ExtraValues.Error),
    #"Expanded Column1" = Table.ExpandRecordColumn(#"Converted to Table", "Column1", 
        {"question_id", "title", "purpose_and_relevance", "analytical_method", "test_statistic_name", "test_statistic_value", "p_value_formatted", "effect_size_name", "effect_size_value", "decision", "practical_interpretation", "evidence_based_conclusion"}, 
        {"Question_ID", "Title", "Purpose", "Method", "Statistic_Name", "Statistic_Value", "P_Value", "Effect_Name", "Effect_Value", "Decision", "Interpretation", "Conclusion"}),
    #"Changed Type" = Table.TransformColumnTypes(#"Expanded Column1", {
        {"Question_ID", type text}, {"Title", type text}, {"Purpose", type text}, 
        {"Method", type text}, {"Statistic_Name", type text}, {"Statistic_Value", type number}, 
        {"P_Value", type text}, {"Effect_Name", type text}, {"Effect_Value", type number}, 
        {"Decision", type text}, {"Interpretation", type text}, {"Conclusion", type text}
    })
in
    #"Changed Type"

// =====================================================================================
// SECTION 2: CSV FALLBACK QUERIES (Offline Direct File Import)
// =====================================================================================
// In Power BI Desktop: New Source -> CSV -> Select file from "exports/" directory:
//
// 1. AttackDistributionFallback:
//    Csv.Document(File.Contents("exports/AttackDistribution.csv"), [Delimiter=",", Columns=4, Encoding=65001, QuoteStyle=QuoteStyle.None])
// 2. HypothesisTestResultsFallback:
//    Csv.Document(File.Contents("exports/HypothesisTestResults.csv"), [Delimiter=",", Encoding=65001])
// 3. ModelMetricsFallback:
//    Csv.Document(File.Contents("exports/ModelMetrics.csv"), [Delimiter=",", Encoding=65001])
// 4. FeatureImportanceFallback:
//    Csv.Document(File.Contents("exports/FeatureImportance.csv"), [Delimiter=",", Encoding=65001])
// 5. CleanFlowsFallback:
//    Csv.Document(File.Contents("exports/iot_pulse_clean_flows.csv"), [Delimiter=",", Encoding=65001])
