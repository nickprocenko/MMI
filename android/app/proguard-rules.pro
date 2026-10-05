# Keep kotlinx.serialization generated serializers for the data model.
-keepclassmembers class com.mmi.members.data.** {
    *** Companion;
    kotlinx.serialization.KSerializer serializer(...);
}
