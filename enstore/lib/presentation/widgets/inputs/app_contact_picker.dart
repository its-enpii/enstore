import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:permission_handler/permission_handler.dart';
import '../../../core/theme/app_colors.dart';
import '../feedback/app_toast.dart';

class ContactEntry {
  final String name;
  final String phone;
  final String label;
  final String accountInfo;
  ContactEntry(this.name, this.phone, this.label, this.accountInfo);
}

class AppContactPicker extends StatefulWidget {
  final Function(String) onContactSelected;
  
  const AppContactPicker({
    super.key, 
    required this.onContactSelected,
  });

  static const _channel = MethodChannel('enstore_app/contacts');

  static Future<void> show(BuildContext context, Function(String) onContactSelected) async {
    final status = await Permission.contacts.status;
    if (!status.isGranted) {
      final newStatus = await Permission.contacts.request();
      if (!newStatus.isGranted) {
        try {
          AppToast.error(context, 'Izin kontak ditolak. Aktifkan di Settings HP.');
        } catch (_) {}
        return;
      }
    }

    try {
      showModalBottomSheet(
        context: context,
        isScrollControlled: true,
        backgroundColor: Colors.transparent,
        builder: (BuildContext modalContext) => AppContactPicker(onContactSelected: onContactSelected),
      );
    } catch (e) {
      debugPrint('Error: $e');
    }
  }

  @override
  State<AppContactPicker> createState() => _AppContactPickerState();
}

class _AppContactPickerState extends State<AppContactPicker> {
  List<ContactEntry> _allEntries = [];
  List<ContactEntry> _filteredEntries = [];
  bool _isLoading = true;
  int _totalNumbers = 0;
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _fetchContacts();
  }

  Future<void> _fetchContacts() async {
    try {
      final List<dynamic> rawContacts = await AppContactPicker._channel.invokeMethod('getAllContacts');
      final List<ContactEntry> entries = [];

      for (final raw in rawContacts) {
        final map = Map<String, dynamic>.from(raw as Map);
        final name = (map['name'] ?? '(No Name)').toString();
        final number = (map['number'] ?? '').toString();
        final label = (map['label'] ?? 'Phone').toString();
        final account = (map['account'] ?? 'Unknown').toString();

        if (number.isNotEmpty) {
          entries.add(ContactEntry(name, number, label, account));
        }
      }

      entries.sort((a, b) => a.name.toLowerCase().compareTo(b.name.toLowerCase()));

      if (mounted) {
        setState(() {
          _allEntries = entries;
          _filteredEntries = entries;
          _totalNumbers = entries.length;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        AppToast.error(context, 'Gagal mengambil kontak: $e');
      }
    }
  }

  void _filterContacts(String query) {
    if (!mounted) return;
    setState(() {
      final lowercaseQuery = query.toLowerCase();
      _filteredEntries = _allEntries
          .where((e) =>
              e.name.toLowerCase().contains(lowercaseQuery) ||
              e.phone.replaceAll(RegExp(r'\D'), '').contains(lowercaseQuery) ||
              e.accountInfo.toLowerCase().contains(lowercaseQuery))
          .toList();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.85,
      decoration: const BoxDecoration(
        color: AppColors.smoke200, // Menggunakan background smoke200 sesuai layout screen
        borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
      ),
      child: Column(
        children: [
          const SizedBox(height: 12),
          Container(
            width: 40, height: 4,
            decoration: BoxDecoration(
              color: AppColors.brand500.withValues(alpha: 0.1), 
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(24, 20, 24, 10),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Pilih Kontak',
                        style: TextStyle(
                          fontSize: 20, // Konsisten dengan judul "Select Nominal"
                          fontWeight: FontWeight.bold, 
                          color: AppColors.brand500.withValues(alpha: 0.9), // Teks utama opacity 0.9
                        ),
                      ),
                      if (!_isLoading)
                        Text(
                          '$_totalNumbers nomor ditemukan',
                          style: TextStyle(
                            fontSize: 12, 
                            color: AppColors.brand500.withValues(alpha: 0.4), // Teks sekunder opacity 0.4
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                    ],
                  ),
                ),
                IconButton(
                  onPressed: () => Navigator.pop(context), 
                  icon: Icon(
                    Icons.close_rounded,
                    color: AppColors.brand500.withValues(alpha: 0.4),
                  ),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 4),
              decoration: BoxDecoration(
                color: AppColors.cloud200, 
                borderRadius: BorderRadius.circular(32), // Pill shape sesuai input form
              ),
              child: TextField(
                controller: _searchController,
                onChanged: _filterContacts,
                style: TextStyle(
                  color: AppColors.brand500.withValues(alpha: 0.9),
                  fontSize: 16,
                ),
                decoration: InputDecoration(
                  hintText: 'Cari nama atau nomor...',
                  hintStyle: TextStyle(
                    color: AppColors.brand500.withValues(alpha: 0.3), // Hint teks opacity 0.3
                    fontSize: 16,
                  ),
                  border: InputBorder.none,
                  prefixIcon: Icon(
                    Icons.search_rounded,
                    color: AppColors.brand500.withValues(alpha: 0.4), // Icon opacity 0.4
                    size: 24,
                  ),
                  isDense: true,
                  contentPadding: const EdgeInsets.symmetric(vertical: 16),
                ),
              ),
            ),
          ),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator(color: AppColors.ocean500))
                : _filteredEntries.isEmpty
                    ? Center(
                        child: Text(
                          'Tidak ada kontak ditemukan',
                          style: TextStyle(color: AppColors.brand500.withValues(alpha: 0.4)),
                        ),
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        physics: const BouncingScrollPhysics(), // Feedback premium kenyal
                        itemCount: _filteredEntries.length,
                        itemBuilder: (context, index) {
                          final entry = _filteredEntries[index];
                          final avatarChar = entry.name.isNotEmpty ? entry.name[0].toUpperCase() : "?";
                          return ListTile(
                            contentPadding: const EdgeInsets.symmetric(horizontal: 24, vertical: 4),
                            leading: CircleAvatar(
                              backgroundColor: AppColors.ocean500.withValues(alpha: 0.1), // Badge background 0.1
                              child: Text(
                                avatarChar,
                                style: const TextStyle(
                                  color: AppColors.ocean500, 
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                            title: Text(
                              entry.name,
                              style: TextStyle(
                                fontWeight: FontWeight.bold, 
                                color: AppColors.brand500.withValues(alpha: 0.9),
                                fontSize: 16,
                              ),
                            ),
                            subtitle: Text(
                              '${entry.label}: ${entry.phone}',
                              style: TextStyle(
                                color: AppColors.brand500.withValues(alpha: 0.4),
                                fontSize: 13,
                              ),
                            ),
                            onTap: () {
                              String cleanPhone = entry.phone.replaceAll(RegExp(r'\D'), '');
                              if (cleanPhone.startsWith('62')) {
                                cleanPhone = '0${cleanPhone.substring(2)}';
                              } else if (cleanPhone.startsWith('8')) {
                                cleanPhone = '0$cleanPhone';
                              }
                              widget.onContactSelected(cleanPhone);
                              Navigator.pop(context);
                            },
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }
}
