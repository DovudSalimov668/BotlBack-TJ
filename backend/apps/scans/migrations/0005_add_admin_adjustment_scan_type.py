from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("scans", "0004_alter_scan_bottle_alter_scan_region_and_more"),
    ]

    operations = [
        migrations.AlterField(
            model_name="scan",
            name="scan_type",
            field=models.CharField(
                choices=[
                    ("purchase", "Purchase"),
                    ("recycle", "Recycle"),
                    ("referral_bonus", "Referral Bonus"),
                    ("admin_adjustment", "Admin Adjustment"),
                ],
                max_length=16,
            ),
        ),
    ]
