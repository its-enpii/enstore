class PhoneHelper {
  static const Map<String, Map<String, String>> providerMap = {
    // Telkomsel
    '0811': {'name': 'Telkomsel', 'code': 'telkomsel'},
    '0812': {'name': 'Telkomsel', 'code': 'telkomsel'},
    '0813': {'name': 'Telkomsel', 'code': 'telkomsel'},
    '0821': {'name': 'Telkomsel', 'code': 'telkomsel'},
    '0822': {'name': 'Telkomsel', 'code': 'telkomsel'},
    '0823': {'name': 'Telkomsel', 'code': 'telkomsel'},
    '0851': {'name': 'Telkomsel', 'code': 'telkomsel'},
    '0852': {'name': 'Telkomsel', 'code': 'telkomsel'},
    '0853': {'name': 'Telkomsel', 'code': 'telkomsel'},

    // Indosat
    '0814': {'name': 'Indosat', 'code': 'indosat'},
    '0815': {'name': 'Indosat', 'code': 'indosat'},
    '0816': {'name': 'Indosat', 'code': 'indosat'},
    '0855': {'name': 'Indosat', 'code': 'indosat'},
    '0856': {'name': 'Indosat', 'code': 'indosat'},
    '0857': {'name': 'Indosat', 'code': 'indosat'},
    '0858': {'name': 'Indosat', 'code': 'indosat'},

    // XL
    '0817': {'name': 'XL', 'code': 'xl'},
    '0818': {'name': 'XL', 'code': 'xl'},
    '0819': {'name': 'XL', 'code': 'xl'},
    '0859': {'name': 'XL', 'code': 'xl'},
    '0877': {'name': 'XL', 'code': 'xl'},
    '0878': {'name': 'XL', 'code': 'xl'},

    // Axis
    '0831': {'name': 'Axis', 'code': 'axis'},
    '0832': {'name': 'Axis', 'code': 'axis'},
    '0833': {'name': 'Axis', 'code': 'axis'},
    '0838': {'name': 'Axis', 'code': 'axis'},

    // Smartfren
    '0881': {'name': 'Smartfren', 'code': 'smartfren'},
    '0882': {'name': 'Smartfren', 'code': 'smartfren'},
    '0883': {'name': 'Smartfren', 'code': 'smartfren'},
    '0884': {'name': 'Smartfren', 'code': 'smartfren'},
    '0885': {'name': 'Smartfren', 'code': 'smartfren'},
    '0886': {'name': 'Smartfren', 'code': 'smartfren'},
    '0887': {'name': 'Smartfren', 'code': 'smartfren'},
    '0888': {'name': 'Smartfren', 'code': 'smartfren'},
    '0889': {'name': 'Smartfren', 'code': 'smartfren'},

    // Three
    '0895': {'name': 'Tri', 'code': 'three'},
    '0896': {'name': 'Tri', 'code': 'three'},
    '0897': {'name': 'Tri', 'code': 'three'},
    '0898': {'name': 'Tri', 'code': 'three'},
    '0899': {'name': 'Tri', 'code': 'three'},
  };

  static String normalize(String phone) {
    phone = phone.replaceAll(RegExp(r'[^0-9+]'), '');
    if (phone.startsWith('+62')) {
      return '0${phone.substring(3)}';
    } else if (phone.startsWith('62')) {
      return '0${phone.substring(2)}';
    }
    return phone;
  }

  static Map<String, String>? getProvider(String phone) {
    final normalized = normalize(phone);
    if (normalized.length < 4) return null;
    final prefix = normalized.substring(0, 4);
    return providerMap[prefix];
  }
}
